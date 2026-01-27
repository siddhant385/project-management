import { getMentorDashboardData, getMentorChartData } from '@/actions/dashboard'
import { getActiveAnnouncements } from '@/actions/announcements'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnnouncementsBanner } from '@/components/announcements'
import { 
  CheckCircle, Clock, Search, Users, Plus, LayoutDashboard, 
  AlertCircle, ArrowRight, Target, Activity, BookOpen, 
  TrendingUp, GraduationCap, Star, Calendar, MessageSquare,
  FolderOpen, BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ProjectPerformanceChart, ActivityHeatmap } from '@/components/charts'

// Next.js 15: Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

// Project Card Component
function ProjectCard({ 
  project, 
  progress, 
  completed = false 
}: { 
  project: any; 
  progress: number;
  completed?: boolean;
}) {
  const initiator = project.initiator || project.student
  
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block p-4 rounded-xl border hover:border-primary/50 hover:shadow-md transition-all bg-gradient-to-r from-background to-muted/30"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{project.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {project.description}
          </p>
        </div>
        <Badge 
          variant={completed ? 'default' : 'secondary'}
          className={completed ? 'bg-green-500 hover:bg-green-600' : ''}
        >
          {completed ? 'Completed' : project.status?.replace('_', ' ') || 'In Progress'}
        </Badge>
      </div>
      
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-2">
          <UserAvatar 
            src={initiator?.avatar_url} 
            name={initiator?.full_name}
            size="xs"
          />
          <span className="text-sm text-muted-foreground">
            {initiator?.full_name}
          </span>
        </div>
        {project.tags && project.tags.length > 0 && (
          <div className="flex gap-1">
            {project.tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {!completed && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
    </Link>
  )
}

export default async function MentorDashboard() {
  const [dashboardData, announcements] = await Promise.all([
    getMentorDashboardData(),
    getActiveAnnouncements(),
  ]);
  
  const { assigned_projects, pending_reviews, open_projects, stats } = dashboardData;
  
  // Get chart data
  const { performanceData, activityData } = await getMentorChartData()
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get milestones for mentor's projects
  const projectIds = assigned_projects.map((p: any) => p.id)
  const { data: milestones } = projectIds.length > 0 
    ? await supabase
        .from('milestones')
        .select('*')
        .in('project_id', projectIds)
        .order('due_date', { ascending: true })
    : { data: [] }

  // Get tasks for mentor's projects
  const { data: tasks } = projectIds.length > 0
    ? await supabase
        .from('tasks')
        .select('*')
        .in('project_id', projectIds)
    : { data: [] }

  // Get recent activity
  const { data: recentActivity } = (milestones && milestones.length > 0)
    ? await supabase
        .from('milestone_activities')
        .select(`
          *,
          milestone:milestones(title, project_id),
          user:profiles(full_name, avatar_url)
        `)
        .in('milestone_id', milestones.map((m: any) => m.id))
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] }
  // const activeProjects = assigned_projects.filter((p: any) => p.status === 'in_progress') || []
  const activeProjects = assigned_projects.filter((p: any) => 
    p.status === 'in_progress' || 
    (p.status === 'open' && p.initiator_id === user?.id)
  ) || []
  const completedProjects = assigned_projects.filter((p: any) => 
    ['evaluated', 'submitted'].includes(p.status)
  ) || []
  // const completedProjects = assigned_projects.filter((p: any) => 
  //   ['evaluated', 'submitted'].includes(p.status)
  // ) || []
  // const completedProjects = assigned_projects.filter((p: any) => p.status === 'completed') || []

  // Calculate statistics
  // const totalStudents = new Set(assigned_projects.map((p: any) => p.student_id || p.initiator?.id)).size
  const upcomingMilestones = milestones?.filter((m: any) => 
    m.status !== 'completed' && new Date(m.due_date) > new Date()
  ) || []
  const overdueMilestones = milestones?.filter((m: any) => 
    m.status !== 'completed' && new Date(m.due_date) < new Date()
  ) || []
  const completedTasks = tasks?.filter((t: any) => t.status === 'done').length || 0
  const totalTasks = tasks?.length || 0
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calculate project progress
  const getProjectProgress = (projectId: string) => {
    const projectMilestones = milestones?.filter((m: any) => m.project_id === projectId) || []
    if (projectMilestones.length === 0) return 0
    const totalProgress = projectMilestones.reduce((sum: number, m: any) => sum + m.progress, 0)
    return Math.round(totalProgress / projectMilestones.length)
  }
  const uniqueStudentIds = new Set<string>()

  assigned_projects.forEach((project: any) => {
    // 1. Add Initiator (agar wo mentor khud nahi hai)
    if (project.initiator_id && project.initiator_id !== user.id) {
      uniqueStudentIds.add(project.initiator_id)
    }

    // 2. Add Team Members (from project_members table)
    if (project.members && Array.isArray(project.members)) {
      project.members.forEach((member: any) => {
        // Mentor ko count mat karo agar wo galti se member table me hai
        if (member.user_id !== user.id) {
          uniqueStudentIds.add(member.user_id)
        }
      })
    }
  })

  const totalStudents = uniqueStudentIds.size

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
        
        {/* Announcements */}
        <AnnouncementsBanner announcements={announcements} />
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Welcome back, {profile?.full_name || 'Mentor'}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here&apos;s what&apos;s happening with your mentored projects
              </p>
            </div>
          </div>
          <Link href="/projects/create">
            <Button className="gap-2 shadow-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              <Plus className="h-4 w-4" /> Propose New Project
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary bg-gradient-to-br from-background to-primary/5 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Projects
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeProjects.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                of {stats.total_mentees} total projects
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-background to-green-500/5 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Students Mentored
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.projects_completed} projects completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-background to-orange-500/5 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Reviews
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pending_reviews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                awaiting your approval
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-background to-purple-500/5 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Task Completion
              </CardTitle>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{taskCompletionRate}%</div>
              <Progress value={taskCompletionRate} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Alert for Pending Reviews */}
        {pending_reviews.length > 0 && (
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 dark:border-orange-900/50">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                      {pending_reviews.length} Application{pending_reviews.length > 1 ? 's' : ''} Awaiting Review
                    </h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Students are waiting for your approval to proceed
                    </p>
                  </div>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 shadow-md" asChild>
                  <Link href="#pending-reviews">
                    Review Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Pending Approvals */}
            {pending_reviews.length > 0 && (
              <Card id="pending-reviews" className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Pending Approvals
                  </CardTitle>
                  <CardDescription>
                    Applications that need your review
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {pending_reviews.map((req: any, index: number) => (
                    <div 
                      key={req.id} 
                      className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                        index !== pending_reviews.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <UserAvatar 
                          src={req.applicant?.avatar_url} 
                          name={req.applicant?.full_name}
                          size="lg"
                          showBorder
                        />
                        <div>
                          <h4 className="font-semibold">{req.applicant?.full_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Applied for <span className="font-medium">{req.project?.title}</span>
                          </p>
                          {req.applicant?.roll_number && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Roll No: {req.applicant.roll_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/projects/${req.project_id}`}>
                          Review <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Active Mentorships with Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  My Mentored Projects
                </CardTitle>
                <CardDescription>
                  Track progress and manage your mentored projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="active" className="gap-2">
                      <Activity className="h-4 w-4" />
                      Active ({activeProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Completed ({completedProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="all" className="gap-2">
                      <FolderOpen className="h-4 w-4" />
                      All ({assigned_projects.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="active" className="space-y-4 mt-0">
                    {activeProjects.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No active projects</p>
                        <p className="text-sm">Check the &quot;Projects Seeking Mentor&quot; section</p>
                      </div>
                    ) : (
                      activeProjects.map((project: any) => (
                        <ProjectCard 
                          key={project.id} 
                          project={project} 
                          progress={getProjectProgress(project.id)}
                        />
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed" className="space-y-4 mt-0">
                    {completedProjects.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No completed projects yet</p>
                        <p className="text-sm">Completed projects will appear here</p>
                      </div>
                    ) : (
                      completedProjects.map((project: any) => (
                        <ProjectCard 
                          key={project.id} 
                          project={project} 
                          progress={100}
                          completed
                        />
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="all" className="space-y-4 mt-0">
                    {assigned_projects.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No projects yet</p>
                        <p className="text-sm">Accept mentorship requests to get started</p>
                      </div>
                    ) : (
                      assigned_projects.map((project: any) => (
                        <ProjectCard 
                          key={project.id} 
                          project={project} 
                          progress={getProjectProgress(project.id)}
                          completed={project.status === 'completed'}
                        />
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates from your mentored projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!recentActivity || recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity: any) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <UserAvatar 
                          src={activity.user?.avatar_url} 
                          name={activity.user?.full_name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user?.full_name}</span>
                            {' '}{activity.activity_type.replace('_', ' ')}{' '}
                            <span className="text-muted-foreground">
                              on {activity.milestone?.title}
                            </span>
                          </p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {activity.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Upcoming Milestones */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Upcoming Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingMilestones.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming milestones
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingMilestones.slice(0, 5).map((milestone: any) => (
                      <div 
                        key={milestone.id} 
                        className="p-3 rounded-lg border bg-gradient-to-r from-background to-muted/30"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{milestone.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(milestone.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Badge variant={
                            milestone.status === 'in_progress' ? 'default' : 'secondary'
                          } className="text-xs">
                            {milestone.progress}%
                          </Badge>
                        </div>
                        <Progress value={milestone.progress} className="h-1 mt-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overdue Alert */}
            {overdueMilestones.length > 0 && (
              <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Clock className="h-5 w-5" />
                    Overdue Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {overdueMilestones.slice(0, 3).map((milestone: any) => (
                      <div key={milestone.id} className="p-2 rounded bg-red-100/50 dark:bg-red-900/30">
                        <p className="text-sm font-medium">{milestone.title}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Due: {new Date(milestone.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projects Seeking Mentor */}
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  New Opportunities
                </CardTitle>
                <CardDescription>
                  Students looking for a mentor
                </CardDescription>
              </CardHeader>
              <CardContent>
                {open_projects.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {open_projects.slice(0, 4).map((project: any) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block p-3 rounded-lg border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar 
                            src={project.initiator?.avatar_url} 
                            name={project.initiator?.full_name}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {project.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {project.initiator?.full_name}
                            </p>
                          </div>
                        </div>
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.tags.slice(0, 2).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
              {open_projects.length > 4 && (
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/projects">
                      View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-primary/10 to-blue-600/10 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Mentorship Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Milestones</span>
                  <span className="font-semibold">{milestones?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed Milestones</span>
                  <span className="font-semibold text-green-600">
                    {milestones?.filter((m: any) => m.status === 'completed').length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Tasks Assigned</span>
                  <span className="font-semibold">{totalTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tasks Completed</span>
                  <span className="font-semibold text-green-600">{completedTasks}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Project Performance Chart */}
          <ProjectPerformanceChart data={performanceData} />
          
          {/* Activity Heatmap */}
          <ActivityHeatmap 
            data={activityData} 
            title="Monthly Activity" 
          />
        </div>
      </div>
    </div>
  )
}