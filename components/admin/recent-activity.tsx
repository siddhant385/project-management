"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  FolderPlus,
  Clock,
} from "lucide-react";

interface RecentUser {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  created_at: string;
}

interface RecentProject {
  id: string;
  title: string;
  status: string;
  created_at: string;
  initiator: { full_name: string }[] | { full_name: string } | null;
}

interface RecentActivityProps {
  recentUsers: RecentUser[];
  recentProjects: RecentProject[];
}

const roleBadgeColors: Record<string, string> = {
  student: "bg-green-500/10 text-green-500",
  mentor: "bg-purple-500/10 text-purple-500",
  admin: "bg-red-500/10 text-red-500",
};

const statusBadgeColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  approved: "bg-blue-500/10 text-blue-500",
  in_progress: "bg-purple-500/10 text-purple-500",
  completed: "bg-green-500/10 text-green-500",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function RecentActivity({ recentUsers, recentProjects }: RecentActivityProps) {
  // Combine and sort activities by date
  const activities = [
    ...recentUsers.map((user) => ({
      type: "user" as const,
      id: user.id,
      title: user.full_name || user.email,
      subtitle: user.email,
      badge: user.role,
      date: user.created_at,
    })),
    ...recentProjects.map((project) => {
      // Handle both array and object initiator
      const initiatorName = Array.isArray(project.initiator) 
        ? project.initiator[0]?.full_name 
        : project.initiator?.full_name;
      return {
        type: "project" as const,
        id: project.id,
        title: project.title,
        subtitle: `by ${initiatorName || "Unknown"}`,
        badge: project.status,
        date: project.created_at,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${activity.type === 'user' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                  {activity.type === "user" ? (
                    <UserPlus className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FolderPlus className="h-4 w-4 text-purple-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={
                      activity.type === "user" 
                        ? roleBadgeColors[activity.badge] 
                        : statusBadgeColors[activity.badge]
                    }
                  >
                    <span className="capitalize">{activity.badge.replace("_", " ")}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(activity.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
