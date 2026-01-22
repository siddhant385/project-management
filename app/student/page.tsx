import { getUserProjects } from '@/actions/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FolderGit2 } from 'lucide-react'
import Link from 'next/link'

// Next.js 15: Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
  const { owned, member } = await getUserProjects()

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Manage your academic projects</p>
        </div>
        <Link href="/projects/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">My Projects</CardTitle>
            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{owned.length}</div>
          </CardContent>
        </Card>
        {/* Add more stats like 'Pending Approvals' if needed */}
      </div>

      {/* Main Section: My Projects */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Created by Me */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Projects Led by Me</CardTitle>
          </CardHeader>
          <CardContent>
            {owned.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No projects yet. Create one to get started!
              </div>
            ) : (
              <div className="space-y-4">
                {owned.map((p) => (
                  <div key={p.id} className="flex justify-between items-center border p-4 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{p.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        p.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {p.status.replace('_', ' ')}
                      </span>
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

        {/* Right: Joined Teams */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Team Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            {member.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                You haven't joined any other teams.
              </div>
            ) : (
              <div className="space-y-4">
                {member.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center border p-4 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{p.title}</h3>
                      <p className="text-xs text-muted-foreground">Member</p>
                    </div>
                    <Link href={`/projects/${p.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}