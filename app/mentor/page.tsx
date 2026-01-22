import { getMentorDashboardData } from '@/actions/dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Search, Users, Plus, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

// Next.js 15: Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'

export default async function MentorDashboard() {
  const { assigned_projects, pending_reviews, open_projects, stats } = await getMentorDashboardData()

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
          <p className="text-muted-foreground">Manage your academic guidance and review progress</p>
        </div>
        <div className="flex gap-2">
           {/* New Feature: Mentor khud ka project idea daal sake */}
           <Link href="/projects/create">
             <Button>
                <Plus className="mr-2 h-4 w-4" /> Propose New Project
             </Button>
           </Link>
        </div>
      </div>

      {/* 2. Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_mentees}</div>
            <p className="text-xs text-muted-foreground">Active mentorships</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_reviews}</div>
            <p className="text-xs text-muted-foreground">Applications to check</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects_completed}</div>
            <p className="text-xs text-muted-foreground">Successfully evaluated</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (2/3 width) - Active Work */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pending Requests */}
          {pending_reviews.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-orange-700 flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                  {pending_reviews.map((req: any) => (
                    <div key={req.id} className="flex justify-between items-center bg-white p-3 rounded border shadow-sm">
                      <div>
                        <p className="font-medium">{req.applicant?.full_name} <span className="text-muted-foreground text-sm">({req.applicant?.roll_number})</span></p>
                        <p className="text-sm text-muted-foreground">
                          Applied for <strong>{req.project?.title}</strong>
                        </p>
                      </div>
                      <Link href={`/projects/${req.project_id}`}>
                         <Button size="sm" variant="outline">Review</Button>
                      </Link>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Active Mentorships */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" /> Active Mentorships
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assigned_projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                   No active projects. Check the "Projects Seeking Mentor" section.
                </div>
              ) : (
                <div className="space-y-4">
                  {assigned_projects.map((p) => (
                    <div key={p.id} className="border rounded-lg p-4 hover:bg-muted/50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-lg">{p.title}</h3>
                          <Badge variant="secondary">{p.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Lead: {p.initiator?.full_name}</p>
                      </div>
                      <Link href={`/projects/${p.id}`}>
                        <Button variant="outline" size="sm">Manage</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (1/3 width) - Discovery */}
        <div className="space-y-6">
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
               <CardTitle className="text-lg flex items-center gap-2">
                 <Search className="w-4 h-4" /> Projects Seeking Mentor
               </CardTitle>
               <CardDescription>
                 Students looking for guidance
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {open_projects.length === 0 ? (
                 <p className="text-sm text-muted-foreground">No open projects found.</p>
               ) : (
                 open_projects.map((p: any) => (
                   <div key={p.id} className="bg-white p-3 rounded border shadow-sm space-y-2">
                      <h4 className="font-semibold text-sm line-clamp-1">{p.title}</h4>
                      <div className="flex flex-wrap gap-1">
                        {p.tags?.slice(0, 2).map((t: string) => (
                           <Badge key={t} variant="secondary" className="text-[10px] px-1 py-0">{t}</Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs text-muted-foreground">By {p.initiator?.full_name}</span>
                        <Link href={`/projects/${p.id}`}>
                           <Button size="sm" variant="ghost" className="h-7 text-xs">View</Button>
                        </Link>
                      </div>
                   </div>
                 ))
               )}
               {open_projects.length > 0 && (
                  <Button variant="link" className="w-full text-xs">View All Open Projects</Button>
               )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}