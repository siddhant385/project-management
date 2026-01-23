import { getProjectDetails } from '@/actions/project-details'
import { acceptApplication, getProjectReview, deleteProjectFile, removeMember, leaveProject } from '@/actions/project'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Separator } from '@/components/ui/separator'
import { FileText, Github, Download, Trash2 } from 'lucide-react'
import Link from 'next/link'

// Shadcn UI Imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Project Components
import { EditProjectDialog } from '@/components/project/edit-project-dialog'
import { DeleteProjectButton } from '@/components/project/delete-project-button'
import { FileUploadDialog } from '@/components/project/file-upload-dialog'
import { ReviewProjectDialog } from '@/components/project/review-project-dialog'
import { RejectApplicationButton } from '@/components/project/reject-application-button'
import { ApplyButton } from '@/components/project/apply-button'
import { ProjectStatusSelect } from '@/components/project/project-status-select'

// Task Components - Using Realtime version
import { RealtimeTaskBoard } from '@/components/tasks'
import { getProjectTasks, getTaskStats } from '@/actions/tasks'
import { Progress } from '@/components/ui/progress'

// Milestone Components - Using Realtime version
import { RealtimeTimeline, ProgressTracker } from '@/components/milestones'
import { getProjectMilestones } from '@/actions/milestones'

// Next.js 15: Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'

const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || 'U'

// ✅ FIX 2: Params ka Type change kiya (Promise)
type Props = {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: Props) {
  // ✅ FIX 3: Params ko await kiya (Next.js 15 requirement)
  const { id } = await params
  
  // Ab 'id' use karo instead of 'params.id'
  const { project, members, files, applications, userRole } = await getProjectDetails(id)
  
  // Get tasks for this project
  const tasks = await getProjectTasks(id)
  const taskStats = await getTaskStats(id)
  
  // Get milestones for this project
  const milestones = await getProjectMilestones(id)
  
  // Get existing review if mentor
  const existingReview = userRole.isMentor ? await getProjectReview(id) : null;

  return (
    <div className="container max-w-5xl mx-auto py-6 md:py-10 px-4 space-y-6 md:space-y-8">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="space-y-4">
        {/* Title & Status */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
             <h1 className="text-2xl md:text-3xl font-bold">{project.title}</h1>
             {userRole.isOwner ? (
               <ProjectStatusSelect 
                 projectId={project.id} 
                 currentStatus={project.status} 
               />
             ) : (
               <Badge variant={project.status === 'open' ? 'default' : 'secondary'} className="w-fit">
                 {project.status.toUpperCase().replace('_', ' ')}
               </Badge>
             )}
          </div>
          <p className="text-muted-foreground text-sm md:text-base">{project.description}</p>
          
          <div className="flex gap-1.5 md:gap-2 flex-wrap">
             {project.tags?.map((tag: string) => (
               <Badge key={tag} variant="outline" className="text-xs md:text-sm">{tag}</Badge>
             ))}
          </div>
        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="flex flex-wrap gap-2">
           
           {/* OWNER ACTIONS */}
           {userRole.isOwner && (
             <>
               <EditProjectDialog project={project} />
               <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
             </>
           )}

           {/* MENTOR ACTIONS */}
           {userRole.isMentor && (
             <ReviewProjectDialog 
               projectId={project.id}
               projectTitle={project.title}
               existingReview={existingReview}
             />
           )}

           {/* VISITOR ACTIONS (Apply Logic) */}
           {!userRole.isOwner && !userRole.isMember && !userRole.hasApplied && project.status === 'open' && (
             <ApplyButton projectId={project.id} projectTitle={project.title} />
           )}

           {/* PENDING STATE */}
           {userRole.hasApplied && userRole.applicationStatus === 'pending' && (
             <Button disabled variant="secondary" size="sm">Application Pending</Button>
           )}
           
           {/* GITHUB LINK */}
           {project.github_link && (
             <Button variant="outline" size="sm" asChild>
               <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                 <Github className="mr-2 h-4 w-4" /> GitHub
               </a>
             </Button>
           )}
        </div>
      </div>

      <Separator />

      {/* ================= TABS SECTION ================= */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs md:text-sm">Timeline</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs md:text-sm">Tasks</TabsTrigger>
          <TabsTrigger value="team" className="text-xs md:text-sm">Team</TabsTrigger>
          <TabsTrigger value="files" className="text-xs md:text-sm">Files</TabsTrigger>
          {userRole.isOwner && <TabsTrigger value="applications" className="text-xs md:text-sm">Requests</TabsTrigger>}
        </TabsList>

        {/* --- TAB: OVERVIEW --- */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Project Details */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Initiated By</span>
                      <div className="flex items-center gap-2 mt-1">
                        <UserAvatar 
                          src={project.initiator?.avatar_url} 
                          name={project.initiator?.full_name}
                          size="xs"
                        />
                        <span className="font-medium">{project.initiator?.full_name}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Mentor</span>
                      <div className="flex items-center gap-2 mt-1">
                        {project.final_mentor ? (
                          <span className="font-medium text-green-700">{project.final_mentor.full_name}</span>
                        ) : (
                          <span className="text-sm text-yellow-600">Not Assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task Progress Card */}
              {taskStats.total > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Task Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>{taskStats.completed} of {taskStats.total} tasks completed</span>
                      <span className="font-medium">{Math.round((taskStats.completed / taskStats.total) * 100)}%</span>
                    </div>
                    <Progress value={(taskStats.completed / taskStats.total) * 100} className="h-2" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                        <p className="font-semibold text-base md:text-lg">{taskStats.todo}</p>
                        <p className="text-muted-foreground text-[10px] md:text-xs">To Do</p>
                      </div>
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
                        <p className="font-semibold text-base md:text-lg">{taskStats.in_progress}</p>
                        <p className="text-muted-foreground text-[10px] md:text-xs">In Progress</p>
                      </div>
                      <div className="p-2 rounded-md bg-yellow-100 dark:bg-yellow-900/30">
                        <p className="font-semibold text-base md:text-lg">{taskStats.review}</p>
                        <p className="text-muted-foreground text-[10px] md:text-xs">Review</p>
                      </div>
                      <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                        <p className="font-semibold text-base md:text-lg">{taskStats.completed}</p>
                        <p className="text-muted-foreground text-[10px] md:text-xs">Done</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Progress Tracker */}
            <div className="lg:col-span-1">
              <ProgressTracker projectId={project.id} />
            </div>
          </div>
        </TabsContent>

        {/* --- TAB: TIMELINE --- */}
        <TabsContent value="timeline" className="mt-6">
          <RealtimeTimeline 
            projectId={project.id}
            initialMilestones={milestones}
            members={members.map((m: any) => ({
              user_id: m.user_id,
              profile: {
                id: m.profile?.id || m.user_id,
                full_name: m.profile?.full_name || 'Unknown',
                avatar_url: m.profile?.avatar_url || null
              }
            }))}
            canEdit={userRole.isOwner || userRole.isMember || userRole.isMentor}
          />
        </TabsContent>

        {/* --- TAB: TASKS --- */}
        <TabsContent value="tasks" className="mt-6">
          <RealtimeTaskBoard 
            projectId={project.id}
            initialTasks={tasks}
            members={members.map((m: any) => ({
              user_id: m.user_id,
              profile: {
                id: m.profile?.id || m.user_id,
                full_name: m.profile?.full_name || 'Unknown',
                avatar_url: m.profile?.avatar_url || null
              }
            }))}
            canEdit={userRole.isOwner || userRole.isMember || userRole.isMentor}
          />
        </TabsContent>

        {/* --- TAB: TEAM --- */}
        <TabsContent value="team" className="mt-6">
          {members.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No team members yet. Applications will appear in the Requests tab.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
               {members.map((m: any) => (
                  <Card key={m.id}>
                     <CardContent className="p-4 flex items-center gap-4">
                        <Link href={`/profile/${m.profile?.id}`}>
                          <UserAvatar 
                            src={m.profile?.avatar_url} 
                            name={m.profile?.full_name}
                            size="md"
                            className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                          />
                        </Link>
                        <div className="flex-1">
                           <Link href={`/profile/${m.profile?.id}`} className="hover:text-primary transition-colors">
                             <p className="font-medium hover:underline">{m.profile?.full_name}</p>
                           </Link>
                           <p className="text-sm text-muted-foreground">{m.profile?.roll_number}</p>
                        </div>
                        {m.is_lead ? (
                          <Badge className="ml-auto">Lead</Badge>
                        ) : (
                          userRole.isOwner && (
                            <form action={removeMember.bind(null, m.id, project.id)}>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          )
                        )}
                     </CardContent>
                  </Card>
               ))}
            </div>
          )}
          
          {/* Leave Project Button for non-owner members */}
          {userRole.isMember && !userRole.isOwner && (
            <div className="mt-4">
              <form action={leaveProject.bind(null, project.id)}>
                <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                  Leave Project
                </Button>
              </form>
            </div>
          )}
        </TabsContent>

        {/* --- TAB: FILES --- */}
        <TabsContent value="files" className="mt-6">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents</CardTitle>
                {(userRole.isMember || userRole.isOwner) && (
                  <FileUploadDialog projectId={project.id} />
                )}
             </CardHeader>
             <CardContent>
                {files.length === 0 ? (
                   <p className="text-muted-foreground text-sm">No files uploaded yet.</p>
                ) : (
                   <div className="space-y-2">
                      {files.map((file: any) => (
                         <div key={file.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50 dark:hover:bg-slate-900">
                            <div className="flex items-center gap-3">
                               <FileText className="h-4 w-4 text-blue-500" />
                               <span className="text-sm font-medium">{file.file_name}</span>
                               <Badge variant="secondary" className="text-[10px]">{file.type}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                               <Button variant="ghost" size="sm" asChild>
                                 <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                   <Download className="h-4 w-4 mr-1" /> Download
                                 </a>
                               </Button>
                               {(userRole.isOwner || userRole.isMember) && (
                                 <form action={deleteProjectFile.bind(null, file.id, project.id)}>
                                   <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </form>
                               )}
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </CardContent>
           </Card>
        </TabsContent>

        {/* --- TAB: APPLICATIONS (Owner Only) --- */}
        {userRole.isOwner && (
          <TabsContent value="applications" className="mt-6">
             <Card>
               <CardHeader><CardTitle>Pending Requests</CardTitle></CardHeader>
               <CardContent>
                  {applications.length === 0 ? (
                     <p className="text-muted-foreground text-sm">No pending applications.</p>
                  ) : (
                     <div className="space-y-4">
                        {applications.map((app: any) => (
                           <div key={app.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded gap-4">
                              <div>
                                 <p className="font-medium">{app.applicant.full_name} <span className="text-xs text-muted-foreground">({app.applicant_role})</span></p>
                                 <p className="text-sm text-muted-foreground italic">"{app.message}"</p>
                                 <div className="flex gap-1 mt-1 flex-wrap">
                                    {app.applicant.skills?.map((s: string) => (
                                       <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                                    ))}
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <form action={acceptApplication.bind(null, app.id, project.id)}>
                                    <Button size="sm">Accept</Button>
                                 </form>
                                 <RejectApplicationButton 
                                   applicationId={app.id} 
                                   applicantName={app.applicant.full_name}
                                   projectId={project.id}
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </CardContent>
             </Card>
          </TabsContent>
        )}

      </Tabs>
    </div>
  )
}