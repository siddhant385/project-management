"use client";

import { Edit2, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  isSubmitting: boolean;
}

export const ProfileHeader = ({ isEditing, setIsEditing, isSubmitting }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-6">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

      {!isEditing ? (
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};