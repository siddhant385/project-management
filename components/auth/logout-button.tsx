"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth/auth"; // Server Action

export function LogoutButton() {
  return (
    <Button 
      onClick={() => signOut()} 
      variant="destructive" // Optional: Red color for logout
    >
      Logout
    </Button>
  );
}