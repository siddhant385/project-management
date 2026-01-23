"use client";

import { FileUpload } from "@/components/file-upload";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  setAvatarUrl: (url: string) => void;
  isEditing: boolean;
  fullName: string;
  userEmail: string;
  userRole: string;
}

export const ProfileAvatar = ({ 
  avatarUrl, 
  setAvatarUrl, 
  isEditing, 
  fullName, 
  userEmail, 
  userRole 
}: ProfileAvatarProps) => {
  return (
    <Card className="max-w-xl mx-auto">
      <CardContent className="pt-6 text-center space-y-6">
        <div className="mx-auto flex flex-col items-center gap-4">
          <UserAvatar 
            src={avatarUrl}
            name={fullName}
            size="2xl"
            showBorder
            className="h-32 w-32 shadow-lg"
          />

          {isEditing && (
            <div className="scale-90">
              <FileUpload
                bucket="avatars"
                onUploadComplete={(url) => setAvatarUrl(url)}
              />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold">{fullName}</h2>
          <p className="text-muted-foreground text-sm">{userEmail}</p>

          <Badge variant="secondary" className="mt-3 uppercase tracking-wider">
            {userRole}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};