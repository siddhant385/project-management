"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { changeUserRole, type AdminUser, type UserRole } from "@/actions/admin";
import { GraduationCap, UserCheck, ShieldCheck } from "lucide-react";

interface RoleChangeDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleOptions: { value: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "student",
    label: "Student",
    icon: <GraduationCap className="h-4 w-4" />,
    description: "Can browse and apply for projects",
  },
  {
    value: "mentor",
    label: "Mentor",
    icon: <UserCheck className="h-4 w-4" />,
    description: "Can create and manage projects",
  },
  {
    value: "admin",
    label: "Admin",
    icon: <ShieldCheck className="h-4 w-4" />,
    description: "Full platform access",
  },
];

export function RoleChangeDialog({ user, open, onOpenChange }: RoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">(user?.role || "");
  const [isPending, startTransition] = useTransition();

  // Reset selected role only when dialog opens with a new user
  useEffect(() => {
    if (open && user) {
      setSelectedRole(user.role);
    }
  }, [open, user?.id]);

  const handleSubmit = () => {
    if (!user || !selectedRole) return;

    startTransition(async () => {
      const result = await changeUserRole(user.id, selectedRole);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Change the role for <strong>{user?.full_name || user?.email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Role</Label>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
              {roleOptions.find(r => r.value === user?.role)?.icon}
              <span className="capitalize font-medium">{user?.role}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>New Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      {role.icon}
                      <div>
                        <span className="font-medium">{role.label}</span>
                        <p className="text-xs text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending || selectedRole === user?.role}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
