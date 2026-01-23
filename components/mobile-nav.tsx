"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Rocket, 
  User as UserIcon, 
  LogOut,
  Home
} from "lucide-react";
import { signOut } from "@/actions/auth/auth";
import { ThemeSwitcher } from "./theme-switcher";
import { NotificationsDropdown } from "./notifications/notifications-dropdown";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface MobileNavProps {
  user: User | null;
  profile: any | null;
  dashboardUrl: string;
}

export function MobileNav({ user, profile, dashboardUrl }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  
  const displayName = profile?.full_name || user?.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  // Check current page
  const isHome = pathname === "/";
  const isDashboard = pathname === dashboardUrl || 
                      pathname === "/student" || 
                      pathname === "/mentor" || 
                      pathname === "/admin";

  // Navigation Links - Dynamic based on current page
  const navLinks = user ? [
    // Show Home if on Dashboard, else show Dashboard
    isDashboard 
      ? { href: "/", label: "Home", icon: Home }
      : { href: dashboardUrl, label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: Rocket },
    { href: "/profile", label: "My Profile", icon: UserIcon },
  ] : [
    { href: "/", label: "Home", icon: Home },
  ];

  return (
    <div className="md:hidden flex items-center gap-2">
      <ThemeSwitcher />
      
      {user && <NotificationsDropdown />}
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative group">
            <Menu className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="sr-only">Toggle menu</span>
            {/* Glow effect */}
            <span className="absolute inset-0 rounded-lg bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 border-l border-white/10 bg-background/95 backdrop-blur-xl">
          <SheetHeader className="p-4 border-b border-white/10 bg-gradient-to-r from-primary/5 to-transparent">
            <SheetTitle className="flex items-center gap-2">
              <div className="relative">
                <Rocket className="h-5 w-5 text-primary relative z-10" />
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full" />
              </div>
              Project Manager
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-[calc(100%-65px)]">
            {/* User Info (if logged in) */}
            {user && (
              <div className="p-4 border-b border-white/10 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-lg">
                      <AvatarImage src={profile?.avatar_url} alt={displayName} className="object-cover" />
                      <AvatarFallback className="text-lg bg-primary/10">{initial}</AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    {profile?.role && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1 capitalize border border-primary/20">
                        {profile.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Links */}
            <nav className="flex-1 overflow-auto p-4">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || 
                    (link.href !== "/" && pathname.startsWith(link.href));
                  
                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {/* Hover effect */}
                        <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <link.icon className={cn(
                          "h-5 w-5 relative z-10 transition-transform group-hover:scale-110",
                          isActive && "text-primary"
                        )} />
                        <span className="relative z-10">{link.label}</span>
                        
                        {/* Active indicator */}
                        {isActive && (
                          <span className="absolute right-3 w-1.5 h-1.5 bg-primary rounded-full" />
                        )}
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            </nav>
            
            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10 mt-auto bg-gradient-to-t from-muted/30 to-transparent">
              {user ? (
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-600 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/30 transition-all"
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <SheetClose asChild>
                    <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                      <Link href="/auth/sign-up">Create Account</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="w-full border-white/10 hover:bg-muted/50">
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                  </SheetClose>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}