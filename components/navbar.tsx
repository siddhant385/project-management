import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/user-nav";
import { LayoutDashboard, Rocket, Search } from "lucide-react";

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
  // Agar role exist karta hai to uske hisab se URL, warna default 'student'
  const userRole = profile?.role || "student"; 
  const dashboardUrl = `/${userRole}`;

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        
        {/* Left Side: Logo + Main Nav Links */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 transition-opacity">
            <Rocket className="h-6 w-6 text-primary" />
            <span>Project Manager</span>
          </Link>

          {/* Main Navigation - Sirf tab dikhega jab user login ho */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href={dashboardUrl} // 👈 Dynamic URL Yahan
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link 
                href="/search" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: User Menu & Theme Toggle */}
        {/* 🔥 dashboardUrl ko props ke through UserNav me bhej rahe hain */}
        <UserNav user={user} profile={profile} dashboardUrl={dashboardUrl} />
        
      </div>
    </nav>
  );
}