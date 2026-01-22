'use server'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export async function getProjectDetails(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch Project Basics + Initiator + Mentor
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      initiator:profiles!initiator_id(full_name, email, avatar_url),
      final_mentor:profiles!final_mentor_id(full_name, email)
    `)
    .eq('id', projectId)
    .single()

  if (error || !project) notFound()

  // 2. Fetch Team Members
  const { data: members } = await supabase
    .from('project_members')
    .select('*, profile:profiles(id, full_name, roll_number, avatar_url)')
    .eq('project_id', projectId)

  // 3. Fetch Files
  const { data: files } = await supabase
    .from('project_files')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  // 4. Check Roles
  const isOwner = user?.id === project.initiator_id
  const isMentor = user?.id === project.final_mentor_id
  
  // Is current user already a member?
  const isMember = members?.some(m => m.user_id === user?.id)

  if (project.status !== 'open' && !isOwner && !isMember && !isMentor) {
    // Option A: 404 Not Found
    notFound() 
    // Option B: Redirect to Dashboard
    // redirect('/dashboard') 
  }

  // 5. (Only for Owner) Fetch Pending Applications
  let applications = []
  if (isOwner) {
    const { data: apps } = await supabase
      .from('project_applications')
      .select('*, applicant:profiles(full_name, roll_number, skills)')
      .eq('project_id', projectId)
      .eq('status', 'pending')
    applications = apps || []
  }

  // 6. (Only for Visitor) Check if I already applied
  let myApplication = null
  if (user && !isOwner && !isMember) {
     const { data: app } = await supabase
      .from('project_applications')
      .select('status')
      .eq('project_id', projectId)
      .eq('applicant_id', user.id)
      .single()
     myApplication = app
  }

  return {
    project,
    members: members || [],
    files: files || [],
    applications,
    userRole: {
      isOwner,
      isMentor,
      isMember,
      hasApplied: !!myApplication,
      applicationStatus: myApplication?.status
    }
  }
}