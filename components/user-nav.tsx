"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, LayoutDashboard, Settings } from "lucide-react";
import { signOut } from "@/actions/auth/auth";
import { ThemeSwitcher } from "./theme-switcher";
import { NotificationsDropdown } from "./notifications/notifications-dropdown";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserNavProps {
  user: User | null;
  profile: any | null;
  dashboardUrl: string; // 👈 New Prop added
}

export function UserNav({ user, profile, dashboardUrl }: UserNavProps) {
  
  const displayName = profile?.full_name || user?.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <ThemeSwitcher />

      {user ? (
        <>
          <NotificationsDropdown />
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={profile?.avatar_url} alt={displayName} className="object-cover" />
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
                {/* 1. Dashboard Link - Uses Dynamic URL */}
                <DropdownMenuItem asChild>
                  <Link href={dashboardUrl} className="cursor-pointer flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>

                {/* 2. Profile Link - Edit Profile */}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>

                 {/* Optional: Settings Link */}
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50"
              onClick={() => signOut()} 
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </>
      ) : (
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
        </div>
      )}
    </div>
  );
}