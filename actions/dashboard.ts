'use server'

import { createClient } from '@/lib/supabase/server'

// 0. Get Public Homepage Stats (No Auth Required)
export async function getPublicStats() {
  const supabase = await createClient()
  
  // Total Projects
  const { count: totalProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
  
  // Active Projects (in_progress)
  const { count: activeProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'in_progress')
  
  // Completed Projects
  const { count: completedProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
  
  // Total Students
  const { count: totalStudents } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')
  
  // Total Mentors
  const { count: totalMentors } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'mentor')
  
  // Recent Projects (for showcase)
  const { data: recentProjects } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      description,
      tags,
      status,
      created_at,
      initiator:profiles!initiator_id(full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(6)

  // Featured/Popular Projects (approved ones with mentor)
  const { data: featuredProjects } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      description,
      tags,
      status,
      created_at,
      initiator:profiles!initiator_id(full_name, avatar_url),
      mentor:profiles!final_mentor_id(full_name, avatar_url)
    `)
    .not('final_mentor_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(4)

  return {
    totalProjects: totalProjects || 0,
    activeProjects: activeProjects || 0,
    completedProjects: completedProjects || 0,
    totalStudents: totalStudents || 0,
    totalMentors: totalMentors || 0,
    recentProjects: recentProjects || [],
    featuredProjects: featuredProjects || []
  }
}

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

// 4. Get Mentor Chart Data - Project Performance & Activity Heatmap
export async function getMentorChartData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { performanceData: [], activityData: [] }

  // A. Get all mentor's projects with milestones and tasks
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      status
    `)
    .eq('final_mentor_id', user.id)

  const projectIds = projects?.map(p => p.id) || []
  
  if (projectIds.length === 0) {
    return { performanceData: [], activityData: [] }
  }

  // B. Get milestones for all projects
  const { data: milestones } = await supabase
    .from('milestones')
    .select('id, project_id, status, progress')
    .in('project_id', projectIds)

  // C. Get tasks for all projects
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, project_id, status')
    .in('project_id', projectIds)

  // D. Calculate performance data for each project
  const performanceData = projects?.map(project => {
    const projectMilestones = milestones?.filter(m => m.project_id === project.id) || []
    const projectTasks = tasks?.filter(t => t.project_id === project.id) || []
    
    const completedMilestones = projectMilestones.filter(m => m.status === 'completed').length
    const completedTasks = projectTasks.filter(t => t.status === 'done').length
    
    // Calculate overall progress
    let progress = 0
    if (projectMilestones.length > 0) {
      progress = Math.round(
        projectMilestones.reduce((sum, m) => sum + m.progress, 0) / projectMilestones.length
      )
    } else if (projectTasks.length > 0) {
      progress = Math.round((completedTasks / projectTasks.length) * 100)
    }

    return {
      name: project.title.length > 15 ? project.title.substring(0, 15) + '...' : project.title,
      progress,
      tasks_completed: completedTasks,
      total_tasks: projectTasks.length,
      milestones_completed: completedMilestones,
      total_milestones: projectMilestones.length,
    }
  }) || []

  // E. Get activity data for heatmap (last 3 months)
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  
  const milestoneIds = milestones?.map(m => m.id) || []
  
  let activities: any[] = []
  if (milestoneIds.length > 0) {
    const { data: activityData } = await supabase
      .from('milestone_activities')
      .select('id, created_at, activity_type, description')
      .in('milestone_id', milestoneIds)
      .gte('created_at', threeMonthsAgo.toISOString())
      .order('created_at', { ascending: false })
    
    activities = activityData || []
  }

  // Also get task updates (assuming we track when tasks are updated)
  // For now, we'll just use milestone activities
  
  // F. Group activities by date for heatmap
  const activityMap = new Map<string, { count: number; activities: { type: string; description: string }[] }>()
  
  activities.forEach(activity => {
    const date = new Date(activity.created_at).toISOString().split('T')[0]
    const existing = activityMap.get(date) || { count: 0, activities: [] }
    existing.count++
    existing.activities.push({
      type: activity.activity_type,
      description: activity.description,
    })
    activityMap.set(date, existing)
  })

  const activityData = Array.from(activityMap.entries()).map(([date, data]) => ({
    date,
    count: data.count,
    activities: data.activities,
  }))

  return {
    performanceData: performanceData.sort((a, b) => b.progress - a.progress),
    activityData,
  }
}