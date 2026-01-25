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
  const tagsString = formData.get('tags') as string
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : []

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title,
      description,
      tags,
      initiator_id: user.id,
      status: 'open'
    })
    .select()
    .single()

  if (error) {
    console.error('Create Project Error:', error)
    throw new Error('Failed to create project')
  }

  // Owner ko automatically project_members me add karo as Lead
  await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: user.id,
    is_lead: true
  })

  revalidatePath('/student')
  redirect('/student')
}

// 2. UPDATE PROJECT
export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // Check ownership
  const { data: project } = await supabase
    .from('projects')
    .select('initiator_id')
    .eq('id', projectId)
    .single()

  if (project?.initiator_id !== user.id) throw new Error('Not authorized to edit this project')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tagsString = formData.get('tags') as string
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : []
  const github_link = formData.get('github_link') as string

  const { error } = await supabase
    .from('projects')
    .update({
      title,
      description,
      tags,
      github_link: github_link || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)

  if (error) throw new Error('Failed to update project')

  revalidatePath(`/projects/${projectId}`)
}

// 3. DELETE PROJECT
export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // Check ownership
  const { data: project } = await supabase
    .from('projects')
    .select('initiator_id')
    .eq('id', projectId)
    .single()

  if (project?.initiator_id !== user.id) throw new Error('Not authorized to delete this project')

  // Delete related data first (cascade would be better in DB)
  await supabase.from('project_applications').delete().eq('project_id', projectId)
  await supabase.from('project_members').delete().eq('project_id', projectId)
  await supabase.from('project_files').delete().eq('project_id', projectId)
  
  const { error } = await supabase.from('projects').delete().eq('id', projectId)

  if (error) throw new Error('Failed to delete project')

  redirect('/student')
}

// 4. APPLY TO PROJECT
export async function applyToProject(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const message = formData.get('message') as string

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
      applicant_role: profile.role,
      message: message,
      status: 'pending'
    })

  if (error) {
    console.error('Application Error:', error)
    throw new Error(error.message)
  }

  revalidatePath(`/projects/${projectId}`)
}

// 5. ACCEPT APPLICATION
export async function acceptApplication(applicationId: string, projectId: string) {
  const supabase = await createClient()

  const { data: application, error: fetchError } = await supabase
    .from('project_applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (fetchError || !application) throw new Error('Application not found')

  const { error: updateError } = await supabase
    .from('project_applications')
    .update({ status: 'accepted' })
    .eq('id', applicationId)

  if (updateError) throw new Error('Failed to update application')

  // MENTOR -> Assign as final mentor
  if (application.applicant_role === 'mentor') {
    await supabase
      .from('projects')
      .update({ 
        final_mentor_id: application.applicant_id,
        status: 'mentor_assigned' 
      })
      .eq('id', projectId)
  } 
  // STUDENT -> Add to team
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

// 6. REJECT APPLICATION
export async function rejectApplication(applicationId: string, projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)

  if (error) throw new Error('Failed to reject application')

  revalidatePath(`/projects/${projectId}`)
}

// 7. REMOVE TEAM MEMBER
// export async function removeMember(memberId: string, projectId: string) {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()

//   // Check if current user is owner
//   const { data: project } = await supabase
//     .from('projects')
//     .select('initiator_id')
//     .eq('id', projectId)
//     .single()

//   if (project?.initiator_id !== user?.id) throw new Error('Only owner can remove members')

//   const { error } = await supabase
//     .from('project_members')
//     .delete()
//     .eq('id', memberId)

//   if (error) throw new Error('Failed to remove member')

//   revalidatePath(`/projects/${projectId}`)
// }

export async function removeMember(memberId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Owner Check (Existing logic)
  const { data: project } = await supabase
    .from('projects')
    .select('initiator_id')
    .eq('id', projectId)
    .single()

  if (project?.initiator_id !== user?.id) {
    throw new Error('Only owner can remove members')
  }
  const { data: memberData, error: fetchError } = await supabase
    .from('project_members')
    .select('user_id')
    .eq('id', memberId)
    .single()

  if (fetchError || !memberData) {
    throw new Error('Member not found')
  }

  const userIdToRemove = memberData.user_id
  const { error: deleteMemberError } = await supabase
    .from('project_members')
    .delete()
    .eq('id', memberId)

  if (deleteMemberError) throw new Error('Failed to remove member')
  const { error: deleteAppError } = await supabase
    .from('project_applications')
    .delete()
    .eq('project_id', projectId)
    .eq('applicant_id', userIdToRemove) // Yahan 'memberId' nahi, 'user_id' chalega

  if (deleteAppError) {
    console.error("Failed to delete application record:", deleteAppError)
  }

  revalidatePath(`/projects/${projectId}`)
}

// 8. LEAVE PROJECT (Self)
export async function leaveProject(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Can't leave if you're the owner
  const { data: project } = await supabase
    .from('projects')
    .select('initiator_id')
    .eq('id', projectId)
    .single()

  if (project?.initiator_id === user.id) throw new Error('Owner cannot leave the project')

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', user.id)

  if (error) throw new Error('Failed to leave project')

  redirect('/student')
}

// 9. CHANGE PROJECT STATUS
export async function updateProjectStatus(projectId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is owner or mentor
  const { data: project } = await supabase
    .from('projects')
    .select('initiator_id, final_mentor_id')
    .eq('id', projectId)
    .single()

  const canUpdate = project?.initiator_id === user?.id || project?.final_mentor_id === user?.id
  if (!canUpdate) throw new Error('Not authorized to change status')

  const { error } = await supabase
    .from('projects')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', projectId)

  if (error) throw new Error('Failed to update status')

  revalidatePath(`/projects/${projectId}`)
}

// 10. UPLOAD PROJECT FILE
export async function uploadProjectFile(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  const fileType = formData.get('type') as string || 'other'

  if (!file) throw new Error('No file provided')

  // Upload to storage
  const fileName = `${projectId}/${Date.now()}-${file.name}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file)

  if (uploadError) throw new Error('File upload failed')

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName)

  // Save to database (matching actual schema - no file_path column)
  const { error: dbError } = await supabase
    .from('project_files')
    .insert({
      project_id: projectId,
      uploaded_by: user.id,
      file_name: file.name,
      file_url: publicUrl,
      type: fileType // 'synopsis', 'report', 'presentation', 'other'
    })

  if (dbError) {
    console.error('DB Error:', JSON.stringify(dbError, null, 2))
    throw new Error(`Failed to save file record: ${dbError.message}`)
  }

  revalidatePath(`/projects/${projectId}`)
}

// 11. DELETE PROJECT FILE
export async function deleteProjectFile(fileId: string, projectId: string) {
  const supabase = await createClient()

  // Get file URL to extract path for storage deletion
  const { data: file } = await supabase
    .from('project_files')
    .select('file_url')
    .eq('id', fileId)
    .single()

  if (file?.file_url) {
    // Extract path from URL (everything after /documents/)
    const urlParts = file.file_url.split('/documents/')
    if (urlParts[1]) {
      await supabase.storage.from('documents').remove([urlParts[1]])
    }
  }

  const { error } = await supabase
    .from('project_files')
    .delete()
    .eq('id', fileId)

  if (error) throw new Error('Failed to delete file')

  revalidatePath(`/projects/${projectId}`)
}

// 12. REVIEW/GRADE PROJECT (Mentor Only) - Uses project_reviews table
export async function reviewProject(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Check if user is the assigned mentor
  const { data: project } = await supabase
    .from('projects')
    .select('final_mentor_id')
    .eq('id', projectId)
    .single()

  if (project?.final_mentor_id !== user.id) throw new Error('Only assigned mentor can review')

  const rating = parseInt(formData.get('rating') as string)
  const comments = formData.get('comments') as string

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from('project_reviews')
    .select('id')
    .eq('project_id', projectId)
    .eq('reviewer_id', user.id)
    .single()

  if (existingReview) {
    // Update existing review
    const { error } = await supabase
      .from('project_reviews')
      .update({ rating, comments })
      .eq('id', existingReview.id)

    if (error) throw new Error('Failed to update review')
  } else {
    // Create new review
    const { error } = await supabase
      .from('project_reviews')
      .insert({
        project_id: projectId,
        reviewer_id: user.id,
        rating,
        comments
      })

    if (error) throw new Error('Failed to create review')
  }

  // Update project status to evaluated
  await supabase
    .from('projects')
    .update({ status: 'evaluated', updated_at: new Date().toISOString() })
    .eq('id', projectId)

  revalidatePath(`/projects/${projectId}`)
}

// 13. GET PROJECT REVIEW
export async function getProjectReview(projectId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('project_reviews')
    .select('*, reviewer:profiles(full_name)')
    .eq('project_id', projectId)
    .single()

  return data
}