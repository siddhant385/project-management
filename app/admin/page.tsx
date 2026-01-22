// Next.js 15: Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the platform and users</p>
      </div>
      
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        Admin features coming soon...
      </div>
    </div>
  )
}