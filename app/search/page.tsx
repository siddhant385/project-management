import { createClient } from '@/lib/supabase/server'
import { SearchPageClient } from '@/components/search/search-page-client'

// Next.js 15: Force dynamic rendering
export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 12

type Props = {
  searchParams: Promise<{ 
    q?: string
    type?: 'projects' | 'mentors' | 'students'
    status?: string
    page?: string
  }>
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()
  const searchType = params.type || 'projects'
  const searchQuery = params.q || ''
  const currentPage = parseInt(params.page || '1')

  // Fetch data based on type
  let projects: any[] = []
  let mentors: any[] = []
  let students: any[] = []

  if (searchType === 'projects') {
    const { data } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        status,
        tags,
        created_at,
        initiator:profiles!initiator_id(id, full_name, avatar_url),
        final_mentor:profiles!final_mentor_id(id, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    let filtered = data || []
    
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter((p: any) => 
        p.title?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
        p.initiator?.full_name?.toLowerCase().includes(searchLower) ||
        p.final_mentor?.full_name?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((p: any) => p.status === params.status)
    }

    // Get member count
    projects = await Promise.all(
      filtered.map(async (project: any) => {
        const { count } = await supabase
          .from('project_members')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)
        return { ...project, memberCount: count || 0 }
      })
    )
  }

  if (searchType === 'mentors') {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor')
      .eq('onboarding_completed', true)
      .not('full_name', 'is', null)
      .order('full_name')

    let filtered = data || []

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter((m: any) => 
        m.full_name?.toLowerCase().includes(searchLower) ||
        m.email?.toLowerCase().includes(searchLower) ||
        m.department?.toLowerCase().includes(searchLower) ||
        m.skills?.some((s: string) => s.toLowerCase().includes(searchLower))
      )
    }

    // Get project count for each mentor
    mentors = await Promise.all(
      filtered.map(async (mentor: any) => {
        const { count } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('final_mentor_id', mentor.id)
        return { ...mentor, projectCount: count || 0 }
      })
    )
  }

  if (searchType === 'students') {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .eq('onboarding_completed', true)
      .not('full_name', 'is', null)
      .order('full_name')

    let filtered = data || []

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter((s: any) => 
        s.full_name?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower) ||
        s.roll_number?.toLowerCase().includes(searchLower) ||
        s.department?.toLowerCase().includes(searchLower) ||
        s.skills?.some((skill: string) => skill.toLowerCase().includes(searchLower))
      )
    }

    // Get project count for each student
    students = await Promise.all(
      filtered.map(async (student: any) => {
        const { count } = await supabase
          .from('project_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', student.id)
        return { ...student, projectCount: count || 0 }
      })
    )
  }

  // Calculate pagination
  const getDataForType = () => {
    switch (searchType) {
      case 'projects': return projects
      case 'mentors': return mentors
      case 'students': return students
      default: return []
    }
  }
  const allData = getDataForType()
  const totalItems = allData.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE

  // Paginate the data
  const paginatedProjects = searchType === 'projects' ? projects.slice(startIndex, endIndex) : []
  const paginatedMentors = searchType === 'mentors' ? mentors.slice(startIndex, endIndex) : []
  const paginatedStudents = searchType === 'students' ? students.slice(startIndex, endIndex) : []

  return (
    <SearchPageClient 
      projects={paginatedProjects}
      mentors={paginatedMentors}
      students={paginatedStudents}
      totalProjects={searchType === 'projects' ? totalItems : 0}
      totalMentors={searchType === 'mentors' ? totalItems : 0}
      totalStudents={searchType === 'students' ? totalItems : 0}
      currentType={searchType}
      currentQuery={searchQuery}
      currentStatus={params.status}
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={ITEMS_PER_PAGE}
    />
  )
}
