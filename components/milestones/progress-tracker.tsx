"use client";

import { useState, useEffect } from "react";
import { getTimelineStats } from "@/actions/milestones";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  projectId: string;
  className?: string;
}

interface TimelineStats {
  total_milestones: number;
  completed_milestones: number;
  in_progress_milestones: number;
  overdue_milestones: number;
  overall_progress: number;
  upcoming_deadlines: Array<{
    id: string;
    title: string;
    due_date: string;
    days_until_due: number;
  }>;
  recent_completions: Array<{
    id: string;
    title: string;
    completed_at: string;
  }>;
}

export function ProgressTracker({ projectId, className }: ProgressTrackerProps) {
  const [stats, setStats] = useState<TimelineStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [projectId]);

  const loadStats = async () => {
    try {
      const data = await getTimelineStats(projectId);
      setStats(data);
    } catch (error) {
      console.error("Failed to load timeline stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-2 bg-muted rounded" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 bg-muted rounded" />
              <div className="h-16 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.total_milestones === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No milestones yet. Add milestones in the Timeline tab.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5" />
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold">{stats.overall_progress}%</span>
          </div>
          <Progress value={stats.overall_progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.completed_milestones} of {stats.total_milestones} milestones
            completed
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium">Completed</span>
            </div>
            <p className="text-lg font-bold">{stats.completed_milestones}</p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium">In Progress</span>
            </div>
            <p className="text-lg font-bold">{stats.in_progress_milestones}</p>
          </div>

          {stats.overdue_milestones > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  Overdue
                </span>
              </div>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {stats.overdue_milestones}
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        {stats.upcoming_deadlines.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Deadlines
            </h4>
            <div className="space-y-2">
              {stats.upcoming_deadlines.slice(0, 3).map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                >
                  <span className="font-medium truncate flex-1 mr-2">
                    {deadline.title}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0",
                      deadline.days_until_due <= 3
                        ? "border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-950/20"
                        : deadline.days_until_due <= 7
                        ? "border-yellow-200 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-300 dark:bg-yellow-950/20"
                        : ""
                    )}
                  >
                    {deadline.days_until_due === 0
                      ? "Today"
                      : deadline.days_until_due === 1
                      ? "Tomorrow"
                      : `${deadline.days_until_due} days`}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Completions */}
        {stats.recent_completions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Recent Completions
            </h4>
            <div className="space-y-1">
              {stats.recent_completions.slice(0, 2).map((completion) => (
                <div
                  key={completion.id}
                  className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded text-sm"
                >
                  <span className="font-medium text-green-700 dark:text-green-300 truncate flex-1 mr-2">
                    {completion.title}
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400 shrink-0">
                    {new Date(completion.completed_at!).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
