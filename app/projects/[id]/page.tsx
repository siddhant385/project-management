import { getProjectDetails } from '@/actions/project-details'
import { applyToProject, acceptApplication } from '@/actions/project'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { FileText, Github, Download, ShieldCheck } from 'lucide-react'

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

  return (
    <div className="container max-w-5xl py-10 space-y-8">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <h1 className="text-3xl font-bold">{project.title}</h1>
             <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
               {project.status.toUpperCase()}
             </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">{project.description}</p>
          
          <div className="flex gap-2 mt-2">
             {project.tags?.map((tag: string) => (
               <Badge key={tag} variant="outline">{tag}</Badge>
             ))}
          </div>
        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="flex flex-col gap-2 min-w-[160px]">
           
           {/* OWNER ACTIONS */}
           {userRole.isOwner && (
             <Button variant="outline">Edit Project</Button>
           )}

           {/* MENTOR ACTIONS */}
           {userRole.isMentor && (
             <Button className="bg-green-600 hover:bg-green-700">
                <ShieldCheck className="mr-2 h-4 w-4" /> Grade Project
             </Button>
           )}

           {/* VISITOR ACTIONS (Apply Logic) */}
           {!userRole.isOwner && !userRole.isMember && !userRole.hasApplied && project.status === 'open' && (
             <Dialog>
               <DialogTrigger asChild>
                 <Button className="w-full">Apply to Join</Button>
               </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>Join Project Team</DialogTitle>
                   <DialogDescription>
                     Tell the project lead why you are a good fit for {project.title}.
                   </DialogDescription>
                 </DialogHeader>
                 
                 <form action={applyToProject.bind(null, project.id)}>
                   <div className="grid gap-4 py-4">
                     <div className="grid gap-2">
                       <Label htmlFor="message">Message</Label>
                       <Textarea 
                         id="message" 
                         name="message" 
                         placeholder="I have experience with React and I am interested in..." 
                         required
                       />
                     </div>
                   </div>
                   <DialogFooter>
                     <Button type="submit">Submit Application</Button>
                   </DialogFooter>
                 </form>
               </DialogContent>
             </Dialog>
           )}

           {/* PENDING STATE */}
           {userRole.hasApplied && userRole.applicationStatus === 'pending' && (
             <Button disabled variant="secondary" className="w-full">Application Pending</Button>
           )}
           
           {/* GITHUB LINK */}
           {project.github_link && (
             <Button variant="ghost" className="w-full justify-start" asChild>
               <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                 <Github className="mr-2 h-4 w-4" /> View Repo
               </a>
             </Button>
           )}
        </div>
      </div>

      <Separator />

      {/* ================= TABS SECTION ================= */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          {userRole.isOwner && <TabsTrigger value="applications">Requests</TabsTrigger>}
        </TabsList>

        {/* --- TAB: OVERVIEW --- */}
        <TabsContent value="overview" className="space-y-4 mt-6">
           <Card>
             <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <span className="text-sm text-muted-foreground">Initiated By</span>
                      <div className="flex items-center gap-2 mt-1">
                         <Avatar className="h-6 w-6"><AvatarFallback>{getInitials(project.initiator?.full_name)}</AvatarFallback></Avatar>
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
        </TabsContent>

        {/* --- TAB: TEAM --- */}
        <TabsContent value="team" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
             {members.map((m: any) => (
                <Card key={m.id}>
                   <CardContent className="p-4 flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={m.profile?.avatar_url} />
                        <AvatarFallback>{getInitials(m.profile?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                         <p className="font-medium">{m.profile?.full_name}</p>
                         <p className="text-sm text-muted-foreground">{m.profile?.roll_number}</p>
                      </div>
                      {m.is_lead && <Badge className="ml-auto">Lead</Badge>}
                   </CardContent>
                </Card>
             ))}
          </div>
        </TabsContent>

        {/* --- TAB: FILES --- */}
        <TabsContent value="files" className="mt-6">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents</CardTitle>
                {(userRole.isMember || userRole.isOwner) && <Button size="sm" variant="outline">Upload File</Button>}
             </CardHeader>
             <CardContent>
                {files.length === 0 ? (
                   <p className="text-muted-foreground text-sm">No files uploaded yet.</p>
                ) : (
                   <div className="space-y-2">
                      {files.map((file: any) => (
                         <div key={file.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                               <FileText className="h-4 w-4 text-blue-500" />
                               <span className="text-sm font-medium">{file.file_name}</span>
                               <Badge variant="secondary" className="text-[10px]">{file.type}</Badge>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" /> Download
                              </a>
                            </Button>
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
                           <div key={app.id} className="flex flex-col md:flex-row justify-between items-center p-4 border rounded">
                              <div className="mb-2 md:mb-0">
                                 <p className="font-medium">{app.applicant.full_name} <span className="text-xs text-muted-foreground">({app.applicant_role})</span></p>
                                 <p className="text-sm text-muted-foreground italic">"{app.message}"</p>
                                 <div className="flex gap-1 mt-1">
                                    {app.applicant.skills?.map((s: string) => (
                                       <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                                    ))}
                                 </div>
                              </div>
                              <form action={acceptApplication.bind(null, app.id, project.id)}>
                                 <Button size="sm">Accept Request</Button>
                              </form>
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