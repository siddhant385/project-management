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