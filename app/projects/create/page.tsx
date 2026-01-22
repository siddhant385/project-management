import { createProject } from '@/actions/project'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default function CreateProjectPage() {
  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Project</CardTitle>
          <CardDescription>
            Share your idea, find a team, and get a mentor.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Form Action seedha Server Action ko call karega */}
          <form action={createProject} className="space-y-6">
            
            {/* 1. Project Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="e.g. Smart Traffic Management System" 
                required 
              />
            </div>

            {/* 2. Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe the problem you are solving and your proposed solution..." 
                className="min-h-[150px]"
                required 
              />
            </div>

            {/* 3. Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags / Tech Stack</Label>
              <Input 
                id="tags" 
                name="tags" 
                placeholder="e.g. React, Python, Machine Learning (comma separated)" 
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Separate keywords with commas. This helps mentors find your project.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              {/* Cancel Button - Wapis dashboard bhejega */}
              <Link href="/student/dashboard">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              
              <Button type="submit">Create Project</Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}