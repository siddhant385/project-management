'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { useCallback, useState, useTransition } from 'react'

type Mentor = {
  id: string
  full_name: string
  avatar_url?: string
}

type Props = {
  mentors: Mentor[]
  currentSearch?: string
  currentStatus?: string
  currentMentor?: string
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'mentor_assigned', label: 'Mentor Assigned' },
  { value: 'completed', label: 'Completed' },
  { value: 'approved', label: 'Approved' },
]

export function ProjectFilters({ mentors, currentSearch, currentStatus, currentMentor }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch || '')

  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      router.push(`/projects?${params.toString()}`)
    })
  }, [router, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', search)
  }

  const clearFilters = () => {
    setSearch('')
    startTransition(() => {
      router.push('/projects')
    })
  }

  const hasFilters = currentSearch || (currentStatus && currentStatus !== 'all') || (currentMentor && currentMentor !== 'all')

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, tags, mentor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            Search
          </Button>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Status Filter */}
        <Select
          value={currentStatus || 'all'}
          onValueChange={(value) => updateFilters('status', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
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

        {/* Mentor Filter */}
        <Select
          value={currentMentor || 'all'}
          onValueChange={(value) => updateFilters('mentor', value)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by mentor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Mentors</SelectItem>
            {mentors.map((mentor) => (
              <SelectItem key={mentor.id} value={mentor.id}>
                {mentor.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
