"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { LayoutDashboard, Rocket, Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  user: User | null;
  dashboardUrl: string;
}

export function NavLinks({ user, dashboardUrl }: NavLinksProps) {
  const pathname = usePathname();
  
  const isDashboard = pathname === dashboardUrl || 
                      pathname === "/student" || 
                      pathname === "/mentor" || 
                      pathname === "/admin";

  // Not logged in - don't show nav links
  if (!user) {
    return null;
  }

  return (
    <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
      {/* Home/Dashboard Toggle */}
      {isDashboard ? (
        <NavLink href="/" icon={Home} label="Home" isActive={false} />
      ) : (
        <NavLink href={dashboardUrl} icon={LayoutDashboard} label="Dashboard" isActive={isDashboard} />
      )}
      
      <NavLink 
        href="/projects" 
        icon={Rocket} 
        label="Projects" 
        isActive={pathname === "/projects" || pathname.startsWith("/projects/")} 
      />
      
      <NavLink 
        href="/search" 
        icon={Search} 
        label="Search" 
        isActive={pathname === "/search"} 
        className="lg:hidden"
      />
    </div>
  );
}

// Individual Nav Link
function NavLink({ 
  href, 
  icon: Icon, 
  label, 
  isActive,
  className
}: { 
  href: string; 
  icon: React.ElementType; 
  label: string; 
  isActive: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
        isActive 
          ? "bg-background text-foreground shadow-sm" 
          : "text-muted-foreground hover:text-foreground hover:bg-background/50",
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
