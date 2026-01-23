import { getStudentDashboardData } from '@/actions/dashboard'
import { getActiveAnnouncements } from '@/actions/announcements'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { UserAvatar } from '@/components/ui/user-avatar'
import { AnnouncementsBanner } from '@/components/announcements'
import { 
  Plus, 
  FolderGit2, 
  CheckCircle2, 
  Clock, 
  Target,
  Calendar,
  ArrowRight,
  ListTodo,
  Activity,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

// Next.js 15: Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'

const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || 'U'

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  evaluated: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
}

const taskStatusColors: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  review: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
}

const priorityColors: Record<string, string> = {
  low: 'text-slate-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
}

export default async function StudentDashboard() {
  const [dashboardData, announcements] = await Promise.all([
    getStudentDashboardData(),
    getActiveAnnouncements(),
  ]);
  
  const { 
    owned, 
    member, 
    stats, 
    my_tasks, 
    upcoming_milestones, 
    recent_activity 
  } = dashboardData;

  const allProjects = [...owned, ...member]
  const taskCompletionRate = stats.tasks_pending + stats.tasks_completed > 0 
    ? Math.round((stats.tasks_completed / (stats.tasks_pending + stats.tasks_completed)) * 100)
    : 0

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Announcements */}
      <AnnouncementsBanner announcements={announcements} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Manage your academic projects and tasks</p>
        </div>
        <Link href="/projects/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_projects}</div>
            <p className="text-xs text-muted-foreground">
              {owned.length} owned, {member.length} joined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasks_pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.tasks_completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCompletionRate}%</div>
            <Progress value={taskCompletionRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming_deadlines}</div>
            <p className="text-xs text-muted-foreground">
              in next 14 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* My Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>Tasks assigned to you across all projects</CardDescription>
              </div>
              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {my_tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ListTodo className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {my_tasks.slice(0, 5).map((task: any) => (
                    <Link 
                      key={task.id} 
                      href={`/projects/${task.project_id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-1 h-10 rounded-full ${
                            task.priority === 'urgent' ? 'bg-red-500' :
                            task.priority === 'high' ? 'bg-orange-500' :
                            task.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-300'
                          }`} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {task.project?.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {task.due_date && (
                            <span className={`text-xs ${
                              new Date(task.due_date) < new Date() 
                                ? 'text-red-500 font-medium' 
                                : 'text-muted-foreground'
                            }`}>
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                          <Badge className={taskStatusColors[task.status] || ''}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Projects Led by Me */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Projects Led by Me</CardTitle>
              </CardHeader>
              <CardContent>
                {owned.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No projects yet. Create one!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {owned.slice(0, 4).map((p: any) => (
                      <Link key={p.id} href={`/projects/${p.id}`}>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="min-w-0">
                            <h3 className="font-medium truncate">{p.title}</h3>
                            <Badge variant="outline" className={`text-[10px] mt-1 ${statusColors[p.status] || ''}`}>
                              {p.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Memberships */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Memberships</CardTitle>
              </CardHeader>
              <CardContent>
                {member.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    You haven't joined any teams.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {member.slice(0, 4).map((p: any) => (
                      <Link key={p.id} href={`/projects/${p.id}`}>
                        <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="min-w-0">
                            <h3 className="font-medium truncate">{p.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              Lead: {p.initiator?.full_name}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Upcoming Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Upcoming Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming_milestones.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No upcoming deadlines
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming_milestones.map((m: any) => {
                    const daysLeft = Math.ceil(
                      (new Date(m.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    )
                    return (
                      <Link key={m.id} href={`/projects/${m.project_id}`}>
                        <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{m.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {m.project?.title}
                              </p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`shrink-0 text-[10px] ${
                                daysLeft <= 3 
                                  ? 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300' 
                                  : daysLeft <= 7
                                  ? 'border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-300'
                                  : ''
                              }`}
                            >
                              {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{m.progress}%</span>
                            </div>
                            <Progress value={m.progress} className="h-1" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recent_activity.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No recent activity
                </div>
              ) : (
                <div className="space-y-4">
                  {recent_activity.map((activity: any) => (
                    <div key={activity.id} className="flex gap-3">
                      <UserAvatar 
                        src={activity.user_profile?.avatar_url} 
                        name={activity.user_profile?.full_name}
                        size="xs"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user_profile?.full_name}</span>
                          {' '}
                          <span className="text-muted-foreground">
                            {activity.activity_type === 'comment' && 'commented on'}
                            {activity.activity_type === 'progress_update' && 'updated progress on'}
                            {activity.activity_type === 'completion' && 'completed'}
                          </span>
                          {' '}
                          <span className="font-medium">{activity.milestone?.title}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/projects/create" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" /> Create New Project
                </Button>
              </Link>
              <Link href="/search" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FolderGit2 className="mr-2 h-4 w-4" /> Browse Projects
                </Button>
              </Link>
              <Link href="/profile" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" /> View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}