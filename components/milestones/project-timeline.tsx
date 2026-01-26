"use client";

import { useState } from "react";
import {
  Milestone,
  MilestoneStatus,
  updateMilestoneProgress,
  deleteMilestone,
} from "@/actions/milestones";
import { AIMilestoneSuggestions } from "@/components/ai/ai-milestone-suggestions"; // 👈 1. Import Add kar
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Circle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { CreateMilestoneDialog } from "./create-milestone-dialog";
import { MilestoneDetailDialog } from "./milestone-detail-dialog";
import { cn } from "@/lib/utils";

const getInitials = (name: string) =>
  name?.substring(0, 2).toUpperCase() || "U";

const statusConfig: Record<
  MilestoneStatus,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
    bgColor: string;
  }
> = {
  pending: {
    label: "Pending",
    color: "text-slate-600",
    bgColor:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: <Circle className="h-3 w-3" />,
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-600",
    bgColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: <Clock className="h-3 w-3" />,
  },
  completed: {
    label: "Completed",
    color: "text-green-600",
    bgColor:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  overdue: {
    label: "Overdue",
    color: "text-red-600",
    bgColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

interface ProjectTimelineProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  milestones: Milestone[];
  members: Array<{
    user_id: string;
    profile: { id: string; full_name: string; avatar_url: string | null };
  }>;
  canEdit: boolean;
}

export function ProjectTimeline({
  projectId,
  projectTitle,
  projectDescription,
  milestones,
  members,
  canEdit,
}: ProjectTimelineProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null
  );
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null
  );
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);

  // Sort milestones by due date
  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  const handleProgressUpdate = async (
    milestoneId: string,
    newProgress: number[]
  ) => {
    setUpdatingProgress(milestoneId);
    try {
      await updateMilestoneProgress(milestoneId, newProgress[0]);
      toast.success(`Progress updated to ${newProgress[0]}%`);
    } catch (error) {
      toast.error("Failed to update progress");
    } finally {
      setUpdatingProgress(null);
    }
  };

  const handleDelete = async (milestoneId: string) => {
    try {
      await deleteMilestone(milestoneId);
      toast.success("Milestone deleted");
    } catch (error) {
      toast.error("Failed to delete milestone");
    }
  };

  const isOverdue = (dueDate: string, status: MilestoneStatus) => {
    return new Date(dueDate) < new Date() && status !== "completed";
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Timeline</h3>
          <p className="text-sm text-muted-foreground">
            Track milestones and project progress
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            
            {/* AI Button */}
            <AIMilestoneSuggestions 
              projectId={projectId}
              projectTitle={projectTitle}
              projectDescription={projectDescription}
              existingMilestones={milestones.map(m => m.title)}
            />

            {/* Manual Button */}
            <CreateMilestoneDialog 
              projectId={projectId} 
              members={members} 
            />
          </div>
        )}
      </div>

      {/* Timeline */}
      {sortedMilestones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No milestones yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first milestone to start tracking progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

          <div className="space-y-6">
            {sortedMilestones.map((milestone) => {
              const daysUntilDue = getDaysUntilDue(milestone.due_date);
              const overdue = isOverdue(milestone.due_date, milestone.status);
              const config = statusConfig[milestone.status];

              return (
                <div key={milestone.id} className="relative flex gap-6">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "relative z-10 flex items-center justify-center w-4 h-4 rounded-full border-2 mt-6",
                      milestone.status === "completed"
                        ? "bg-green-500 border-green-500"
                        : overdue
                        ? "bg-red-500 border-red-500"
                        : "bg-background border-border"
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        milestone.status === "completed"
                          ? "bg-white"
                          : overdue
                          ? "bg-white"
                          : "bg-primary"
                      )}
                    />
                  </div>

                  {/* Milestone Card */}
                  <Card
                    className={cn(
                      "flex-1 cursor-pointer hover:shadow-md transition-all",
                      overdue && "border-red-200 dark:border-red-800"
                    )}
                    onClick={() => setSelectedMilestone(milestone)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {milestone.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={config.bgColor}>
                              {config.icon}
                              <span className="ml-1">{config.label}</span>
                            </Badge>

                            {/* Due date info */}
                            <div
                              className={cn(
                                "flex items-center gap-1 text-xs",
                                overdue
                                  ? "text-red-500 font-medium"
                                  : daysUntilDue <= 7 && daysUntilDue > 0
                                  ? "text-yellow-600 font-medium"
                                  : "text-muted-foreground"
                              )}
                            >
                              <Calendar className="h-3 w-3" />
                              {overdue
                                ? `Overdue by ${Math.abs(daysUntilDue)} day${
                                    Math.abs(daysUntilDue) !== 1 ? "s" : ""
                                  }`
                                : daysUntilDue === 0
                                ? "Due today"
                                : daysUntilDue > 0
                                ? `${daysUntilDue} day${
                                    daysUntilDue !== 1 ? "s" : ""
                                  } left`
                                : `Due ${new Date(
                                    milestone.due_date
                                  ).toLocaleDateString()}`}
                            </div>
                          </div>
                        </div>

                        {canEdit && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMilestone(milestone);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(milestone.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {milestone.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {milestone.description}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">
                            {milestone.progress}%
                          </span>
                        </div>
                        {canEdit && milestone.status !== "completed" ? (
                          <Slider
                            value={[milestone.progress]}
                            onValueCommit={(value) =>
                              handleProgressUpdate(milestone.id, value)
                            }
                            disabled={updatingProgress === milestone.id}
                            max={100}
                            step={5}
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <Progress
                            value={milestone.progress}
                            className="h-2"
                          />
                        )}
                      </div>

                      {/* Assignee */}
                      {milestone.assignee && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <UserAvatar
                            src={milestone.assignee.avatar_url}
                            name={milestone.assignee.full_name}
                            size="xs"
                          />
                          <span className="text-sm text-muted-foreground">
                            {milestone.assignee.full_name}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Milestone Detail Dialog */}
      {selectedMilestone && (
        <MilestoneDetailDialog
          milestone={selectedMilestone}
          canEdit={canEdit}
          open={!!selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
          onUpdate={() => {
            // Trigger page refresh to get updated data
            window.location.reload();
          }}
        />
      )}

      {/* Edit Milestone Dialog */}
      {editingMilestone && (
        <CreateMilestoneDialog
          projectId={projectId}
          members={members}
          editMilestone={editingMilestone}
          open={!!editingMilestone}
          onClose={() => setEditingMilestone(null)}
        />
      )}
    </div>
  );
}
