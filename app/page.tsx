import Link from "next/link";
import { getPublicStats } from "@/actions/dashboard";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { 
  Rocket, 
  Users, 
  GraduationCap, 
  Trophy, 
  ArrowRight, 
  Code2,
  GitBranch,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  Lock
} from "lucide-react";

const statusColors: Record<string, string> = {
  open: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  in_progress: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  completed: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  pending_approval: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30"
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  pending_approval: "Pending"
};

export default async function Home() {
  const stats = await getPublicStats();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen">
      {/* Hero Section - Cleaner, More Professional */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/10 blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* College Badge - More Subtle */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-8">
              <GraduationCap className="h-3.5 w-3.5" />
              Jabalpur Engineering College
            </div>
            
            {/* Main Heading - Bolder, Cleaner */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Build Projects.
              <br />
              <span className="text-primary">Get Mentored.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-8 text-balance">
              JEC 's own platform to help students build real-world projects with faculty mentorship.
              Structured milestones, team collaboration, aur progress tracking - sab ek jagah.
            </p>
            
            {/* CTA Buttons - Cleaner */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isAuthenticated ? (
                <Button asChild size="lg" className="gap-2 px-6">
                  <Link href="/student">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="gap-2 px-6">
                    <Link href="/auth/sign-up">
                      Start Building
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link href="/auth/login">
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Compact, Clean */}
      <section className="py-12 border-y bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8">
            <StatItem value={stats.totalProjects} label="Projects" />
            <StatItem value={stats.activeProjects} label="Active" highlight />
            <StatItem value={stats.completedProjects} label="Completed" />
            <StatItem value={stats.totalStudents} label="Students" />
            <StatItem value={stats.totalMentors} label="Mentors" className="col-span-2 sm:col-span-1" />
          </div>
        </div>
      </section>

      {/* Recent Projects - Main Focus */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">Live Projects</h2>
              <p className="text-sm text-muted-foreground">
                Real projects built by JEC students
              </p>
            </div>
            {isAuthenticated && (
              <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                <Link href="/projects">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.recentProjects.slice(0, 6).map((project: any) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>

          {!isAuthenticated && stats.recentProjects.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Sign in to view project details and apply
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login" className="gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  Sign in to Explore
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features - Minimal Grid */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">How It Works</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Simple workflow for students and mentors
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <FeatureItem 
              icon={<Rocket className="h-5 w-5" />}
              title="Create Project"
              description="Define scope, add team members"
            />
            <FeatureItem 
              icon={<GraduationCap className="h-5 w-5" />}
              title="Get Mentor"
              description="Faculty approves & guides"
            />
            <FeatureItem 
              icon={<GitBranch className="h-5 w-5" />}
              title="Track Progress"
              description="Milestones, tasks, deadlines"
            />
            <FeatureItem 
              icon={<Trophy className="h-5 w-5" />}
              title="Complete & Showcase"
              description="Build your portfolio"
            />
          </div>
        </div>
      </section>

      {/* Why Choose - Trust Indicators */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">
                Live sync across all team members
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1">Faculty Verified</h3>
              <p className="text-sm text-muted-foreground">
                All projects mentor-approved
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1">Track Deadlines</h3>
              <p className="text-sm text-muted-foreground">
                Never miss a milestone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Simple */}
      {!isAuthenticated && (
        <section className="py-16 lg:py-20 bg-primary/5 border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Start?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Join {stats.totalStudents}+ JEC students already building projects
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/auth/sign-up">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Footer - Minimal */}
      <footer className="py-6 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">JEC Project Hub</span>
            </div>
            <p>© {new Date().getFullYear()} Jabalpur Engineering College</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Stat Item - Cleaner
function StatItem({ 
  value, 
  label, 
  highlight = false,
  className = ""
}: { 
  value: number; 
  label: string; 
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      <div className={`text-3xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

// Feature Item - Compact
function FeatureItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-medium text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

// Project Card - Non-auth users can't click
function ProjectCard({ 
  project, 
  isAuthenticated 
}: { 
  project: any; 
  isAuthenticated: boolean;
}) {
  const initiator = project.initiator;
  
  const CardWrapper = isAuthenticated 
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={`/projects/${project.id}`} className="block">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div className="relative group cursor-not-allowed">
          {children}
          {/* Login overlay on hover */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <Link 
              href="/auth/login" 
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Lock className="h-4 w-4" />
              Sign in to view
            </Link>
          </div>
        </div>
      );

  return (
    <CardWrapper>
      <Card className={`h-full transition-all duration-200 ${isAuthenticated ? 'hover:shadow-md hover:border-primary/30' : ''}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-sm line-clamp-1 flex-1">
              {project.title}
            </h3>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[project.status] || ''}`}>
              {statusLabels[project.status] || project.status}
            </Badge>
          </div>
          
          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[32px]">
            {project.description || "No description"}
          </p>
          
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {project.tags.slice(0, 2).map((tag: string, i: number) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {tag}
                </span>
              ))}
              {project.tags.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{project.tags.length - 2}
                </span>
              )}
            </div>
          )}
          
          {/* Author */}
          <div className="flex items-center gap-2 pt-3 border-t">
            <UserAvatar 
              src={initiator?.avatar_url} 
              name={initiator?.full_name || 'Unknown'}
              size="xs"
            />
            <span className="text-xs text-muted-foreground truncate">
              {initiator?.full_name || 'Unknown'}
            </span>
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  );
}