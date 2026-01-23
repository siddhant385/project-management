import { redirect } from "next/navigation";
import { 
  getAdminStats, 
  getAllUsers, 
  getAllProjects,
  getAnnouncements,
  getRecentActivity,
  getDepartmentStats,
  isAdmin 
} from "@/actions/admin";
import { 
  StatsCards, 
  UsersTable, 
  ProjectsTable,
  AnnouncementsCard,
  RecentActivity,
  DepartmentStatsCard 
} from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, FolderKanban, Megaphone } from "lucide-react";

// Next.js 15: Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Check if user is admin
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    redirect("/");
  }

  // Fetch data
  const [stats, usersData, projectsData, announcements, recentActivity, departmentStats] = await Promise.all([
    getAdminStats(),
    getAllUsers(1, 10),
    getAllProjects(1, 10),
    getAnnouncements(),
    getRecentActivity(10),
    getDepartmentStats(),
  ]);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the platform, users, projects, and announcements</p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <FolderKanban className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Announce</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatsCards stats={stats} />
          <DepartmentStatsCard stats={departmentStats} />
          <RecentActivity 
            recentUsers={recentActivity.recentUsers} 
            recentProjects={recentActivity.recentProjects} 
          />
        </TabsContent>

        <TabsContent value="users">
          <UsersTable initialUsers={usersData.users} initialTotal={usersData.total} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsTable initialProjects={projectsData.projects} initialTotal={projectsData.total} />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementsCard initialAnnouncements={announcements} />
        </TabsContent>
      </Tabs>
    </div>
  )
}