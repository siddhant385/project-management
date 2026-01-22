'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 1. CREATE PROJECT
export async function createProject(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  // Tags ko comma se split karke array bana rahe hain
  const tagsString = formData.get('tags') as string
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : []

  const { error } = await supabase
    .from('projects')
    .insert({
      title,
      description,
      tags,
      initiator_id: user.id,
      status: 'open'
    })

  if (error) {
    console.error('Create Project Error:', error)
    throw new Error('Failed to create project')
  }

  revalidatePath('/student') // Dashboard refresh
  redirect('/student')
}

// 2. APPLY TO PROJECT
export async function applyToProject(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const message = formData.get('message') as string

  // Pehle user ka role pata karte hain (Student hai ya Mentor)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  const { error } = await supabase
    .from('project_applications')
    .insert({
      project_id: projectId,
      applicant_id: user.id,
      applicant_role: profile.role, // Ye zaroori column hai
      message: message,
      status: 'pending'
    })

  if (error) {
    console.error('Application Error:', error)
    // Agar duplicate application hai to throw karo (form action must return void)
    throw new Error(error.message)
  }

  revalidatePath(`/projects/${projectId}`)
}

// 3. ACCEPT APPLICATION (Main Logic)
export async function acceptApplication(applicationId: string, projectId: string) {
  const supabase = await createClient()

  // 1. Application ki details nikalo taaki pata chale Student hai ya Mentor
  const { data: application, error: fetchError } = await supabase
    .from('project_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (fetchError || !application) throw new Error('Application not found')

  // 2. Application status update karo 'accepted'
  const { error: updateError } = await supabase
    .from('project_applications')
    .update({ status: 'accepted' })
    .eq('id', applicationId)

  if (updateError) throw new Error('Failed to update application')

  // 3. LOGIC BRANCHING
  
  // CASE A: Agar MENTOR hai -> Project ka Final Mentor bana do
  if (application.applicant_role === 'mentor') {
    await supabase
      .from('projects')
      .update({ 
        final_mentor_id: application.applicant_id,
        status: 'mentor_assigned' 
      })
      .eq('id', projectId)
  } 
  
  // CASE B: Agar STUDENT hai -> Project Members mein add karo
  else {
    await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: application.applicant_id,
        is_lead: false
      })
  }

  revalidatePath(`/projects/${projectId}`)
}