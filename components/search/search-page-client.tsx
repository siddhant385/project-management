'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Calendar, Search, FolderGit2, GraduationCap, UserCog, Mail, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || 'U'

// Status badge styling
const statusStyles: Record<string, string> = {
  open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  mentor_assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'mentor_assigned', label: 'Mentor Assigned' },
  { value: 'completed', label: 'Completed' },
  { value: 'approved', label: 'Approved' },
]

type Props = {
  projects: any[]
  mentors: any[]
  students: any[]
  totalProjects: number
  totalMentors: number
  totalStudents: number
  currentType: 'projects' | 'mentors' | 'students'
  currentQuery: string
  currentStatus?: string
  currentPage: number
  totalPages: number
  itemsPerPage: number
}

export function SearchPageClient({ 
  projects, 
  mentors, 
  students,
  totalProjects,
  totalMentors,
  totalStudents,
  currentType, 
  currentQuery,
  currentStatus,
  currentPage,
  totalPages,
  itemsPerPage
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentQuery)

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to first page when changing filters
    params.delete('page')
    if (key === 'type') {
      params.delete('status') // Reset status when changing type
    }
    startTransition(() => {
      router.push(`/search?${params.toString()}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams('q', search)
  }

  const getResultCount = () => {
    switch (currentType) {
      case 'projects': return totalProjects
      case 'mentors': return totalMentors
      case 'students': return totalStudents
      default: return 0
    }
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', page.toString())
    } else {
      params.delete('page')
    }
    startTransition(() => {
      router.push(`/search?${params.toString()}`)
    })
  }

  const getTypeLabel = () => {
    switch (currentType) {
      case 'projects': return 'project'
      case 'mentors': return 'mentor'
      case 'students': return 'student'
      default: return 'result'
    }
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Search</h1>
          <p className="text-muted-foreground">Find projects, mentors, and students</p>
        </div>
        <Link href="/projects/create">
          <Button>Create New Project</Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, skills, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {/* Type Radio Buttons */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Search in:</Label>
            <div className="flex flex-wrap gap-4">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                currentType === 'projects' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-border hover:border-primary/50'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="projects"
                  checked={currentType === 'projects'}
                  onChange={(e) => updateParams('type', e.target.value)}
                  className="sr-only"
                />
                <FolderGit2 className="h-4 w-4" />
                <span className="font-medium">Projects</span>
              </label>

              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                currentType === 'mentors' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-border hover:border-primary/50'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="mentors"
                  checked={currentType === 'mentors'}
                  onChange={(e) => updateParams('type', e.target.value)}
                  className="sr-only"
                />
                <UserCog className="h-4 w-4" />
                <span className="font-medium">Mentors</span>
              </label>

              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                currentType === 'students' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-border hover:border-primary/50'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="students"
                  checked={currentType === 'students'}
                  onChange={(e) => updateParams('type', e.target.value)}
                  className="sr-only"
                />
                <GraduationCap className="h-4 w-4" />
                <span className="font-medium">Students</span>
              </label>
            </div>
          </div>

          {/* Status Filter - Only for Projects */}
          {currentType === 'projects' && (
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Status:</Label>
              <Select
                value={currentStatus || 'all'}
                onValueChange={(value) => updateParams('status', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Found {getResultCount()} {getTypeLabel()}{getResultCount() !== 1 ? 's' : ''}
        {currentQuery && <span> for "{currentQuery}"</span>}
      </div>

      {/* Results */}
      {currentType === 'projects' && <ProjectsGrid projects={projects} />}
      {currentType === 'mentors' && <MentorsGrid mentors={mentors} />}
      {currentType === 'students' && <StudentsGrid students={students} />}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {/* First page */}
            {currentPage > 3 && (
              <>
                <Button
                  variant={currentPage === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={isPending}
                  className="w-9"
                >
                  1
                </Button>
                {currentPage > 4 && <span className="text-muted-foreground px-1">...</span>}
              </>
            )}
            
            {/* Page numbers around current */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                const diff = Math.abs(page - currentPage)
                return diff <= 2
              })
              .map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                  disabled={isPending}
                  className="w-9"
                >
                  {page}
                </Button>
              ))}
            
            {/* Last page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="text-muted-foreground px-1">...</span>}
                <Button
                  variant={currentPage === totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={isPending}
                  className="w-9"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Page info */}
      {totalPages > 1 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, getResultCount())} of {getResultCount()}
        </p>
      )}
    </div>
  )
}

// Projects Grid Component
function ProjectsGrid({ projects }: { projects: any[] }) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FolderGit2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No projects found.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project: any) => (
        <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
              <Badge className={statusStyles[project.status] || 'bg-gray-100'}>
                {project.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col justify-between gap-4">
            {/* Tags */}
            <div className="flex gap-1 flex-wrap">
              {project.tags?.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
              {project.tags?.length > 3 && (
                <Badge variant="outline" className="text-xs">+{project.tags.length - 3}</Badge>
              )}
            </div>

            {/* Project Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href={`/profile/${project.initiator?.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={project.initiator?.avatar_url} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(project.initiator?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate hover:underline">{project.initiator?.full_name}</span>
              </Link>
              
              {project.final_mentor && (
                <Link href={`/profile/${project.final_mentor?.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Badge variant="secondary" className="text-[10px]">Mentor</Badge>
                  <span className="truncate hover:underline">{project.final_mentor?.full_name}</span>
                </Link>
              )}
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{project.memberCount} member{project.memberCount !== 1 ? 's' : ''}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <Link href={`/projects/${project.id}`} className="mt-auto">
              <Button variant="outline" className="w-full">View Details</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Mentors Grid Component
function MentorsGrid({ mentors }: { mentors: any[] }) {
  if (mentors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No mentors found.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {mentors.map((mentor: any) => (
        <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Link href={`/profile/${mentor.id}`}>
              <Avatar className="h-20 w-20 mx-auto mb-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                <AvatarImage src={mentor.avatar_url} />
                <AvatarFallback className="text-xl">
                  {getInitials(mentor.full_name)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link href={`/profile/${mentor.id}`}>
              <CardTitle className="hover:text-primary transition-colors cursor-pointer">
                {mentor.full_name}
              </CardTitle>
            </Link>
            {mentor.department && (
              <CardDescription>{mentor.department}</CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Skills */}
            {mentor.skills && mentor.skills.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-center">
                {mentor.skills.slice(0, 4).map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
                {mentor.skills.length > 4 && (
                  <Badge variant="outline" className="text-xs">+{mentor.skills.length - 4}</Badge>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{mentor.projectCount} project{mentor.projectCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Bio */}
            {mentor.bio && (
              <p className="text-sm text-muted-foreground text-center line-clamp-2">
                {mentor.bio}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Link href={`/profile/${mentor.id}`} className="flex-1">
                <Button variant="outline" className="w-full">View Profile</Button>
              </Link>
              {mentor.email && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={`mailto:${mentor.email}`}>
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Students Grid Component
function StudentsGrid({ students }: { students: any[] }) {
  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No students found.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your search.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {students.map((student: any) => (
        <Card key={student.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <Link href={`/profile/${student.id}`}>
              <Avatar className="h-20 w-20 mx-auto mb-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                <AvatarImage src={student.avatar_url} />
                <AvatarFallback className="text-xl">
                  {getInitials(student.full_name)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Link href={`/profile/${student.id}`}>
              <CardTitle className="hover:text-primary transition-colors cursor-pointer">
                {student.full_name}
              </CardTitle>
            </Link>
            <CardDescription>
              {student.roll_number && <span>{student.roll_number}</span>}
              {student.roll_number && student.department && <span> • </span>}
              {student.department && <span>{student.department}</span>}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Skills */}
            {student.skills && student.skills.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-center">
                {student.skills.slice(0, 4).map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
                {student.skills.length > 4 && (
                  <Badge variant="outline" className="text-xs">+{student.skills.length - 4}</Badge>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FolderGit2 className="h-4 w-4" />
                <span>{student.projectCount} project{student.projectCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Bio */}
            {student.bio && (
              <p className="text-sm text-muted-foreground text-center line-clamp-2">
                {student.bio}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Link href={`/profile/${student.id}`} className="flex-1">
                <Button variant="outline" className="w-full">View Profile</Button>
              </Link>
              {student.email && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={`mailto:${student.email}`}>
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
