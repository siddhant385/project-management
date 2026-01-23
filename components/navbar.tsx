import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/user-nav";
import { MobileNav } from "@/components/mobile-nav";
import { NavLinks } from "@/components/nav-links";
import { Rocket, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Navbar() {
  const supabase = await createClient();

  // 1. User check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;

  // 2. Profile fetch
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  // 🔥 DYNAMIC DASHBOARD URL LOGIC
  const userRole = profile?.role || "student"; 
  const dashboardUrl = `/${userRole}`;

  return (
    <nav className="w-full border-b sticky top-0 z-50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        
        {/* Left Side: Logo + Main Nav Links */}
        <div className="flex items-center gap-2 lg:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-base font-bold leading-none">ProjectHub</span>
              <span className="text-[10px] text-muted-foreground font-normal leading-none mt-0.5">JEC Portal</span>
            </div>
          </Link>

          {/* Main Navigation - Desktop Only */}
          <NavLinks user={user} dashboardUrl={dashboardUrl} />
        </div>

        {/* Center: Search (Desktop) */}
        {user && (
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <Link href="/search" className="w-full">
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground font-normal h-10 px-4 bg-muted/30 border-muted-foreground/20 hover:bg-muted/50 hover:border-muted-foreground/30"
              >
                <Search className="h-4 w-4 mr-3" />
                Search projects, mentors, students...
                <kbd className="ml-auto pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </Link>
          </div>
        )}

        {/* Right Side: Mobile Nav + User Menu */}
        <div className="flex items-center gap-2">
          {/* Mobile Navigation */}
          <MobileNav user={user} profile={profile} dashboardUrl={dashboardUrl} />
          
          {/* Desktop User Nav */}
          <div className="hidden md:flex">
            <UserNav user={user} profile={profile} dashboardUrl={dashboardUrl} />
          </div>
        </div>
        
      </div>
    </nav>
  );
}