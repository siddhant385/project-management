'use server'

import { createClient } from '@/lib/supabase/server'

// 1. Get Global Stats (RPC call)
export async function getDashboardStats() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_dashboard_stats')
  
  if (error) {
    console.error('Error fetching stats:', error)
    return {
      total_projects: 0,
      pending_approvals: 0,
      active_mentors: 0,
      completed_projects: 0
    }
  }
  
  // RPC kabhi kabhi array return karta hai, safe side ke liye check:
  const stats = Array.isArray(data) ? data[0] : data
  return stats
}

// 2. Get "My Projects" (Owned + Member)
export async function getUserProjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { owned: [], member: [] }

  // A. Projects I Created (Owner)
  const { data: owned } = await supabase
    .from('projects')
    .select('*, initiator:profiles!initiator_id(full_name)') // Initiator name bhi le aate hain
    .eq('initiator_id', user.id)
    .order('created_at', { ascending: false })

  // B. Projects I Joined (Member)
  const { data: memberProjects } = await supabase
    .from('project_members')
    .select(`
      project:projects(
        *, 
        initiator:profiles!initiator_id(full_name)
      )
    `) 
    .eq('user_id', user.id)

  // FIX: Null safety + Flattening
  const joined = memberProjects
    ?.map((p: any) => p.project)
    .filter((p: any) => p !== null) || []

  return {
    owned: owned || [],
    member: joined
  }
}

// 2.5 Get Enhanced Student Dashboard Data
export async function getStudentDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { 
    owned: [], 
    member: [], 
    stats: { total_projects: 0, tasks_pending: 0, tasks_completed: 0, upcoming_deadlines: 0 },
    my_tasks: [],
    upcoming_milestones: [],
    recent_activity: []
  }

  // A. Projects I Created (Owner)
  const { data: owned } = await supabase
    .from('projects')
    .select('*, initiator:profiles!initiator_id(full_name)')
    .eq('initiator_id', user.id)
    .order('created_at', { ascending: false })

  // B. Projects I Joined (Member)
  const { data: memberProjects } = await supabase
    .from('project_members')
    .select(`
      project:projects(
        *, 
        initiator:profiles!initiator_id(full_name)
      )
    `) 
    .eq('user_id', user.id)

  const joined = memberProjects
    ?.map((p: any) => p.project)
    .filter((p: any) => p !== null) || []

  // Get all project IDs user is involved in
  const allProjectIds = [
    ...(owned?.map(p => p.id) || []),
    ...joined.map((p: any) => p.id)
  ]

  // C. My Tasks (assigned to me)
  let myTasks: any[] = []
  let taskStats = { pending: 0, completed: 0 }
  
  if (allProjectIds.length > 0) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select(`
        *,
        project:projects(id, title)
      `)
      .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
      .in('project_id', allProjectIds)
      .order('due_date', { ascending: true })
      .limit(10)

    myTasks = tasks || []
    
    // Task stats
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('status')
      .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
      .in('project_id', allProjectIds)

    taskStats.pending = allTasks?.filter(t => t.status !== 'completed').length || 0
    taskStats.completed = allTasks?.filter(t => t.status === 'completed').length || 0
  }

  // D. Upcoming Milestones (next 14 days)
  let upcomingMilestones: any[] = []
  if (allProjectIds.length > 0) {
    const today = new Date().toISOString().split('T')[0]
    const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const { data: milestones } = await supabase
      .from('milestones')
      .select(`
        *,
        project:projects(id, title)
      `)
      .in('project_id', allProjectIds)
      .neq('status', 'completed')
      .gte('due_date', today)
      .lte('due_date', twoWeeksLater)
      .order('due_date', { ascending: true })
      .limit(5)

    upcomingMilestones = milestones || []
  }

  // E. Recent Activity (task completions, milestone updates)
  let recentActivity: any[] = []
  if (allProjectIds.length > 0) {
    // Get recent milestone activities
    const { data: activities } = await supabase
      .from('milestone_activities')
      .select(`
        *,
        milestone:milestones(title, project_id),
        user_profile:profiles!milestone_activities_user_id_fkey(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // Filter activities for user's projects
    recentActivity = (activities || []).filter((a: any) => 
      a.milestone && allProjectIds.includes(a.milestone.project_id)
    ).slice(0, 5)
  }

  // F. Stats
  const stats = {
    total_projects: (owned?.length || 0) + joined.length,
    tasks_pending: taskStats.pending,
    tasks_completed: taskStats.completed,
    upcoming_deadlines: upcomingMilestones.length
  }

  return {
    owned: owned || [],
    member: joined,
    stats,
    my_tasks: myTasks,
    upcoming_milestones: upcomingMilestones,
    recent_activity: recentActivity
  }
}

// 3. Mentor Dashboard Data (UPDATED FOR NEW UI 🚀)
export async function getMentorDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { assigned_projects: [], pending_reviews: [], open_projects: [], stats: { total_mentees: 0, pending_reviews: 0, projects_completed: 0 } }

  // A. Projects where I am the assigned Mentor
  const { data: assignedProjects } = await supabase
    .from('projects')
    .select('*, initiator:profiles!initiator_id(full_name)')
    .eq('final_mentor_id', user.id)
    .order('created_at', { ascending: false })
    
  // B. Pending Requests logic
  const { data: myProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('initiator_id', user.id)

  const myProjectIds = myProjects?.map(p => p.id) || []

  let requests: any[] = []
  if (myProjectIds.length > 0) {
    const { data } = await supabase
      .from('project_applications')
      .select('*, project:projects(title), applicant:profiles(full_name, roll_number)')
      .eq('status', 'pending')
      .in('project_id', myProjectIds)
    
    requests = data || []
  }

  // C. NEW: Fetch Open Projects (Seeking Mentor)
  // Logic: Status 'open' ho aur abhi tak koi 'final_mentor_id' na ho
  const { data: openProjects } = await supabase
    .from('projects')
    .select('*, initiator:profiles!initiator_id(full_name, department)')
    .is('final_mentor_id', null) // Jiska koi mentor nahi
    .eq('status', 'open')
    .neq('initiator_id', user.id) // Apna khud ka project na dikhaye
    .limit(5) // Top 5 dikhao discovery ke liye

  // D. NEW: Calculate Stats for Top Cards
  const stats = {
    total_mentees: assignedProjects?.length || 0,
    pending_reviews: requests.length,
    // Count projects marked as evaluated/completed
    projects_completed: assignedProjects?.filter((p: any) => p.status === 'evaluated' || p.status === 'completed').length || 0
  }

  return {
    assigned_projects: assignedProjects || [],
    pending_reviews: requests,
    open_projects: openProjects || [], // New Return
    stats // New Return
  }
}