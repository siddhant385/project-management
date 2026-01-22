"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { LayoutDashboard, Rocket, Search, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  user: User | null;
  dashboardUrl: string;
}

export function NavLinks({ user, dashboardUrl }: NavLinksProps) {
  const pathname = usePathname();
  
  // Check if we're on home or dashboard
  const isHome = pathname === "/";
  const isDashboard = pathname === dashboardUrl || 
                      pathname === "/student" || 
                      pathname === "/mentor" || 
                      pathname === "/admin";

  if (!user) {
    // Not logged in - show Browse Projects link
    return (
      <div className="hidden md:flex items-center gap-1">
        <NavLink href="/projects" icon={Rocket} label="Browse Projects" isActive={pathname === "/projects"} />
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-1">
      {/* Conditional Home/Dashboard Link */}
      {isDashboard ? (
        // On Dashboard → Show Home
        <NavLink href="/" icon={Home} label="Home" isActive={false} />
      ) : (
        // On Home or Other → Show Dashboard
        <NavLink href={dashboardUrl} icon={LayoutDashboard} label="Dashboard" isActive={isDashboard} />
      )}
      
      <NavLink href="/projects" icon={Rocket} label="Projects" isActive={pathname === "/projects" || pathname.startsWith("/projects/")} />
      <NavLink href="/search" icon={Search} label="Search" isActive={pathname === "/search"} />
    </div>
  );
}

// Individual Nav Link with glassmorphism hover effect
function NavLink({ 
  href, 
  icon: Icon, 
  label, 
  isActive 
}: { 
  href: string; 
  icon: React.ElementType; 
  label: string; 
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group",
        isActive 
          ? "text-primary bg-primary/10" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {/* Hover glassmorphism effect */}
      <span className={cn(
        "absolute inset-0 rounded-lg transition-all duration-200",
        "bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0",
        "group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/10",
        "group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
      )} />
      
      <Icon className={cn(
        "h-4 w-4 relative z-10 transition-transform group-hover:scale-110",
        isActive && "text-primary"
      )} />
      <span className="relative z-10">{label}</span>
      
      {/* Active indicator */}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full" />
      )}
    </Link>
  );
}
