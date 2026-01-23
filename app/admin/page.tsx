import { redirect } from "next/navigation";
import { getAdminStats, getAllUsers, isAdmin } from "@/actions/admin";
import { StatsCards, UsersTable } from "@/components/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users } from "lucide-react";

// Next.js 15: Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Check if user is admin
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    redirect("/");
  }

  // Fetch data
  const [stats, usersData] = await Promise.all([
    getAdminStats(),
    getAllUsers(1, 10),
  ]);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the platform, users, and monitor statistics</p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatsCards stats={stats} />
        </TabsContent>

        <TabsContent value="users">
          <UsersTable initialUsers={usersData.users} initialTotal={usersData.total} />
        </TabsContent>
      </Tabs>
    </div>
  )
}