import Link from "next/link";
import { getPublicStats } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Rocket, 
  Users, 
  GraduationCap, 
  Trophy, 
  ArrowRight, 
  Sparkles,
  Code2,
  Lightbulb,
  Target,
  Clock
} from "lucide-react";

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  pending_approval: "bg-purple-500/10 text-purple-600 border-purple-500/20"
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  pending_approval: "Pending"
};

export default async function Home() {
  const stats = await getPublicStats();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container relative mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* College Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur px-4 py-1.5 text-sm mb-6 shadow-sm">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="font-medium">Jabalpur Engineering College</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Project Management
              </span>
              <br />
              <span className="text-foreground">System</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              JEC Jabalpur ka official platform jahan students apne innovative projects create karte hain, 
              mentors guide karte hain, aur ideas reality bante hain.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/auth/sign-up">
                  <Rocket className="h-5 w-5" />
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/projects">
                  <Code2 className="h-5 w-5" />
                  Browse Projects
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <StatsCard 
              icon={<Rocket className="h-6 w-6" />} 
              value={stats.totalProjects} 
              label="Total Projects" 
            />
            <StatsCard 
              icon={<Sparkles className="h-6 w-6" />} 
              value={stats.activeProjects} 
              label="Active Projects" 
            />
            <StatsCard 
              icon={<Trophy className="h-6 w-6" />} 
              value={stats.completedProjects} 
              label="Completed" 
            />
            <StatsCard 
              icon={<Users className="h-6 w-6" />} 
              value={stats.totalStudents} 
              label="Students" 
            />
            <StatsCard 
              icon={<GraduationCap className="h-6 w-6" />} 
              value={stats.totalMentors} 
              label="Mentors" 
            />
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {stats.featuredProjects.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Projects</h2>
                <p className="text-muted-foreground">Mentor-approved innovative projects by our students</p>
              </div>
              <Button asChild variant="ghost" className="hidden sm:flex gap-2">
                <Link href="/projects">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.featuredProjects.map((project: any) => (
                <ProjectCard key={project.id} project={project} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Projects */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Recent Projects</h2>
              <p className="text-muted-foreground">Latest projects added to the platform</p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex gap-2">
              <Link href="/projects">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.recentProjects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          
          <div className="flex justify-center mt-10 sm:hidden">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/projects">
                View All Projects <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Use This Platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete ecosystem for academic project management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Lightbulb className="h-8 w-8" />}
              title="Idea to Reality"
              description="Transform your project ideas into reality with structured milestones and task management."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8" />}
              title="Expert Mentorship"
              description="Get guidance from experienced faculty mentors who help you navigate through challenges."
            />
            <FeatureCard 
              icon={<Target className="h-8 w-8" />}
              title="Track Progress"
              description="Real-time progress tracking with visual timelines, task boards, and activity heatmaps."
            />
            <FeatureCard 
              icon={<Code2 className="h-8 w-8" />}
              title="Collaborate"
              description="Work seamlessly with team members, share files, and coordinate tasks efficiently."
            />
            <FeatureCard 
              icon={<Clock className="h-8 w-8" />}
              title="Meet Deadlines"
              description="Never miss a deadline with smart notifications and upcoming milestone reminders."
            />
            <FeatureCard 
              icon={<Trophy className="h-8 w-8" />}
              title="Showcase Work"
              description="Build your portfolio and showcase completed projects to potential employers."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
            <p className="text-muted-foreground mb-8">
              Join hundreds of JEC students who are already building amazing projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/auth/sign-up">
                  <Rocket className="h-5 w-5" />
                  Create Account
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">Already have an account? Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="font-semibold">JEC Project Manager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Jabalpur Engineering College. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border-none shadow-none bg-muted/50 hover:bg-muted transition-colors">
      <CardHeader>
        <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-2">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

// Project Card Component
function ProjectCard({ project, featured = false }: { project: any; featured?: boolean }) {
  const initiator = project.initiator as any;
  const mentor = project.mentor as any;
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/projects/${project.id}`}>{project.title}</Link>
          </CardTitle>
          <Badge variant="outline" className={`shrink-0 ${statusColors[project.status] || ''}`}>
            {statusLabels[project.status] || project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description || "No description available"}
        </p>
        
        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.tags.slice(0, 3).map((tag: string, i: number) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Author & Mentor */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={initiator?.avatar_url} />
              <AvatarFallback className="text-xs">
                {initiator?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {initiator?.full_name || 'Unknown'}
            </span>
          </div>
          
          {featured && mentor && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <GraduationCap className="h-3 w-3" />
              <span className="truncate max-w-[80px]">{mentor.full_name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}