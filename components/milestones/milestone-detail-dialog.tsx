"use client";

import { useState, useEffect } from "react";
import {
  Milestone,
  MilestoneStatus,
  getMilestoneActivities,
  addMilestoneActivity,
  updateMilestoneStatus,
  updateMilestoneProgress,
  MilestoneActivity,
} from "@/actions/milestones";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Circle,
  Send,
  Activity,
  Edit2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";

const getInitials = (name: string) =>
  name?.substring(0, 2).toUpperCase() || "U";

const activityIcons: Record<string, React.ReactNode> = {
  comment: <MessageSquare className="h-3 w-3" />,
  progress_update: <Activity className="h-3 w-3" />,
  status_change: <Clock className="h-3 w-3" />,
  completion: <CheckCircle2 className="h-3 w-3" />,
  created: <Circle className="h-3 w-3" />,
};

const statusConfig = {
  pending: {
    label: "Pending",
    bgColor:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: <Circle className="h-3 w-3" />,
  },
  in_progress: {
    label: "In Progress",
    bgColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: <Clock className="h-3 w-3" />,
  },
  completed: {
    label: "Completed",
    bgColor:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  overdue: {
    label: "Overdue",
    bgColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

interface MilestoneDetailDialogProps {
  milestone: Milestone;
  canEdit: boolean;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function MilestoneDetailDialog({
  milestone,
  canEdit,
  open,
  onClose,
  onUpdate,
}: MilestoneDetailDialogProps) {
  const [activities, setActivities] = useState<MilestoneActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [addingComment, setAddingComment] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<MilestoneStatus>(milestone.status);
  const [currentProgress, setCurrentProgress] = useState(milestone.progress);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: { comment: "" },
  });

  const commentValue = watch("comment");

  useEffect(() => {
    if (open) {
      loadActivities();
      setCurrentStatus(milestone.status);
      setCurrentProgress(milestone.progress);
      setIsEditingStatus(false);
      setIsEditingProgress(false);
    }
  }, [open, milestone.id, milestone.status, milestone.progress]);

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const data = await getMilestoneActivities(milestone.id);
      setActivities(data);
    } catch (error) {
      toast.error("Failed to load activities");
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleStatusChange = async (newStatus: MilestoneStatus) => {
    setCurrentStatus(newStatus);
  };

  const saveStatus = async () => {
    if (currentStatus === milestone.status) {
      setIsEditingStatus(false);
      return;
    }
    
    setSavingStatus(true);
    try {
      await updateMilestoneStatus(milestone.id, currentStatus);
      toast.success("Status updated successfully");
      setIsEditingStatus(false);
      await loadActivities();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
      setCurrentStatus(milestone.status);
    } finally {
      setSavingStatus(false);
    }
  };

  const saveProgress = async () => {
    if (currentProgress === milestone.progress) {
      setIsEditingProgress(false);
      return;
    }
    
    setSavingProgress(true);
    try {
      await updateMilestoneProgress(milestone.id, currentProgress);
      toast.success("Progress updated successfully");
      setIsEditingProgress(false);
      await loadActivities();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update progress");
      setCurrentProgress(milestone.progress);
    } finally {
      setSavingProgress(false);
    }
  };

  const onAddComment = async (data: { comment: string }) => {
    if (!data.comment.trim()) return;

    setAddingComment(true);
    try {
      await addMilestoneActivity(milestone.id, {
        activity_type: "comment",
        description: data.comment.trim(),
      });
      reset();
      await loadActivities();
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const isOverdue =
    new Date(milestone.due_date) < new Date() &&
    milestone.status !== "completed";
  const daysUntilDue = Math.ceil(
    (new Date(milestone.due_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const config = statusConfig[currentStatus];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {milestone.title}
          </DialogTitle>
          <DialogDescription>
            Milestone details and progress tracking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Status</h4>
              {canEdit && !isEditingStatus && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditingStatus(true)}
                  className="h-7 px-2"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditingStatus ? (
              <div className="flex items-center gap-2">
                <Select 
                  value={currentStatus} 
                  onValueChange={(value) => handleStatusChange(value as MilestoneStatus)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Circle className="h-3 w-3 text-slate-500" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-blue-500" />
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Completed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  onClick={saveStatus}
                  disabled={savingStatus}
                  className="h-8"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {savingStatus ? "Saving..." : "Save"}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setCurrentStatus(milestone.status);
                    setIsEditingStatus(false);
                  }}
                  className="h-8"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Badge className={config.bgColor}>
                {config.icon}
                <span className="ml-1">{config.label}</span>
              </Badge>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            {milestone.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {milestone.description}
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Progress</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {isEditingProgress ? currentProgress : milestone.progress}%
                  </span>
                  {canEdit && !isEditingProgress && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingProgress(true)}
                      className="h-7 px-2"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
              
              {isEditingProgress ? (
                <div className="space-y-3">
                  <Slider
                    value={[currentProgress]}
                    onValueChange={(value) => setCurrentProgress(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={saveProgress}
                      disabled={savingProgress}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      {savingProgress ? "Saving..." : "Save Progress"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setCurrentProgress(milestone.progress);
                        setIsEditingProgress(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Progress value={milestone.progress} className="h-2" />
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Due Date
                </label>
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    isOverdue ? "text-red-500 font-medium" : "text-foreground"
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  {new Date(milestone.due_date).toLocaleDateString()}
                  {isOverdue && (
                    <span className="text-xs">
                      (Overdue by {Math.abs(daysUntilDue)} days)
                    </span>
                  )}
                </div>
              </div>

              {milestone.assignee && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Assigned To
                  </label>
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      src={milestone.assignee.avatar_url}
                      name={milestone.assignee.full_name}
                      size="xs"
                    />
                    <span className="text-sm">
                      {milestone.assignee.full_name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <h4 className="font-medium">Activity</h4>

            {loadingActivities ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activity yet
                  </p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <UserAvatar
                        src={activity.user_profile.avatar_url}
                        name={activity.user_profile.full_name}
                        size="sm"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {activityIcons[activity.activity_type] || (
                            <Activity className="h-3 w-3" />
                          )}
                          <span className="text-sm font-medium">
                            {activity.user_profile.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Add Comment */}
          {canEdit && (
            <form onSubmit={handleSubmit(onAddComment)} className="space-y-2">
              <Textarea
                {...register("comment")}
                placeholder="Add a comment..."
                className="min-h-[60px]"
                disabled={addingComment}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!commentValue?.trim() || addingComment}
                >
                  <Send className="h-3 w-3 mr-1" />
                  {addingComment ? "Adding..." : "Add Comment"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
