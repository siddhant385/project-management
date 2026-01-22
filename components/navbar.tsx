import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/user-nav";
import { MobileNav } from "@/components/mobile-nav";
import { NavLinks } from "@/components/nav-links";
import { Rocket } from "lucide-react";

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
    <nav className="w-full border-b border-white/10 sticky top-0 z-50 bg-background/60 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/40 shadow-[0_2px_20px_-2px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_20px_-2px_rgba(0,0,0,0.3)]">
      {/* Glassmorphism Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      
      <div className="container relative flex h-16 items-center justify-between px-4">
        
        {/* Left Side: Logo + Main Nav Links */}
        <div className="flex items-center gap-8">
          {/* Logo with glow effect */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 transition-all group">
            <div className="relative">
              <Rocket className="h-6 w-6 text-primary relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/30 transition-colors" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Project Manager
            </span>
            <span className="sm:hidden font-bold">PM</span>
          </Link>

          {/* Main Navigation - Desktop Only (Client Component) */}
          <NavLinks user={user} dashboardUrl={dashboardUrl} />
        </div>

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