"use client";

import { useRealtimeApplications } from "@/lib/supabase/realtime"; // 👈 Check path (jahan tune realtime.ts rakha hai)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { acceptApplication } from "@/actions/project";
import { RejectApplicationButton } from "@/components/project/reject-application-button";
import { Users } from "lucide-react";

interface Props {
  projectId: string;
  initialApplications: any[];
}

// Component 1: Realtime List (Tab Content ke liye)
export function RealtimeApplicationsList({ projectId, initialApplications }: Props) {
  // Hook se data le rahe hain
  const { applications } = useRealtimeApplications(projectId, initialApplications);

  // Sirf pending requests dikhani hain
  const pendingApps = applications.filter((app) => app.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingApps.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending applications.</p>
        ) : (
          <div className="space-y-4">
            {pendingApps.map((app: any) => (
              <div
                key={app.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded gap-4 bg-muted/20"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <UserAvatar
                        src={app.applicant?.avatar_url}
                        name={app.applicant?.full_name}
                        size="xs"
                    />
                    <p className="font-medium">
                        {app.applicant?.full_name}
                        <span className="text-xs text-muted-foreground ml-2">
                        ({app.applicant_role})
                        </span>
                    </p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground italic mb-2">
                    "{app.message}"
                  </p>
                  
                  <div className="flex gap-1 flex-wrap">
                    {app.applicant?.skills?.map((s: string) => (
                      <Badge key={s} variant="outline" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <form action={acceptApplication.bind(null, app.id, projectId)} className="w-full md:w-auto">
                    <Button size="sm" className="w-full">Accept</Button>
                  </form>
                  <div className="w-full md:w-auto">
                    <RejectApplicationButton
                        applicationId={app.id}
                        applicantName={app.applicant?.full_name}
                        projectId={projectId}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Component 2: Realtime Badge (Tab Trigger ke liye)
export function RealtimeApplicationsBadge({ projectId, initialApplications }: Props) {
  const { applications } = useRealtimeApplications(projectId, initialApplications);
  const pendingCount = applications.filter((app) => app.status === "pending").length;

  if (pendingCount === 0) return null;

  return (
    <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1 flex items-center justify-center text-[10px]">
      {pendingCount}
    </Badge>
  );
}