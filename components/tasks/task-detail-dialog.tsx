"use client";

import { useState } from "react";
import { Task, TaskStatus, TaskPriority, updateTask, deleteTask } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  User, 
  Flag, 
  Clock, 
  Trash2,
  AlertCircle,
  Circle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || "U";

const priorityConfig: Record<TaskPriority, { label: string; color: string; icon: React.ReactNode }> = {
  low: { 
    label: "Low", 
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: <Circle className="h-3 w-3" />
  },
  medium: { 
    label: "Medium", 
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: <Clock className="h-3 w-3" />
  },
  high: { 
    label: "High", 
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    icon: <AlertCircle className="h-3 w-3" />
  },
  urgent: { 
    label: "Urgent", 
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    icon: <AlertCircle className="h-3 w-3 fill-current" />
  },
};

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "To Do", color: "bg-slate-500" },
  in_progress: { label: "In Progress", color: "bg-blue-500" },
  review: { label: "Review", color: "bg-yellow-500" },
  completed: { label: "Completed", color: "bg-green-500" },
};

interface TaskDetailDialogProps {
  task: Task;
  members: Array<{
    user_id: string;
    profile: { id: string; full_name: string; avatar_url: string | null };
  }>;
  canEdit: boolean;
  open: boolean;
  onClose: () => void;
}

export function TaskDetailDialog({
  task,
  members,
  canEdit,
  open,
  onClose,
}: TaskDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState(task);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setLoading(true);
    try {
      await updateTask(task.id, { status: newStatus });
      setCurrentTask({ ...currentTask, status: newStatus });
      toast.success(`Status updated to ${statusConfig[newStatus].label}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
    setLoading(false);
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    setLoading(true);
    try {
      await updateTask(task.id, { priority: newPriority });
      setCurrentTask({ ...currentTask, priority: newPriority });
      toast.success(`Priority updated to ${priorityConfig[newPriority].label}`);
    } catch (error) {
      toast.error("Failed to update priority");
    }
    setLoading(false);
  };

  const handleAssigneeChange = async (userId: string) => {
    setLoading(true);
    try {
      await updateTask(task.id, { assigned_to: userId || null });
      const newAssignee = members.find(m => m.user_id === userId)?.profile || null;
      setCurrentTask({ 
        ...currentTask, 
        assigned_to: userId || null,
        assignee: newAssignee ? {
          id: newAssignee.id,
          full_name: newAssignee.full_name,
          avatar_url: newAssignee.avatar_url
        } : null
      });
      toast.success("Assignee updated");
    } catch (error) {
      toast.error("Failed to update assignee");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    setLoading(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
      onClose();
    } catch (error) {
      toast.error("Failed to delete task");
    }
    setLoading(false);
  };

  const isOverdue = currentTask.due_date && new Date(currentTask.due_date) < new Date() && currentTask.status !== "completed";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl pr-8">{currentTask.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {currentTask.description && (
            <div>
              <p className="text-sm text-muted-foreground">{currentTask.description}</p>
            </div>
          )}

          <Separator />

          {/* Task Properties */}
          <div className="grid gap-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>Status</span>
              </div>
              {canEdit ? (
                <Select 
                  value={currentTask.status} 
                  onValueChange={handleStatusChange}
                  disabled={loading}
                >
                  <SelectTrigger className="w-[150px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(statusConfig) as TaskStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${statusConfig[status].color}`} />
                          {statusConfig[status].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={statusConfig[currentTask.status].color}>
                  {statusConfig[currentTask.status].label}
                </Badge>
              )}
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flag className="h-4 w-4" />
                <span>Priority</span>
              </div>
              {canEdit ? (
                <Select 
                  value={currentTask.priority} 
                  onValueChange={handlePriorityChange}
                  disabled={loading}
                >
                  <SelectTrigger className="w-[150px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(priorityConfig) as TaskPriority[]).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center gap-2">
                          {priorityConfig[priority].icon}
                          {priorityConfig[priority].label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={priorityConfig[currentTask.priority].color}>
                  {priorityConfig[currentTask.priority].icon}
                  <span className="ml-1">{priorityConfig[currentTask.priority].label}</span>
                </Badge>
              )}
            </div>

            {/* Assignee */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Assignee</span>
              </div>
              {canEdit ? (
                <Select 
                  value={currentTask.assigned_to || "unassigned"} 
                  onValueChange={(v) => handleAssigneeChange(v === "unassigned" ? "" : v)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={member.profile.avatar_url || undefined} />
                            <AvatarFallback className="text-[8px]">
                              {getInitials(member.profile.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          {member.profile.full_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : currentTask.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={currentTask.assignee.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(currentTask.assignee.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{currentTask.assignee.full_name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Unassigned</span>
              )}
            </div>

            {/* Due Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due Date</span>
              </div>
              {currentTask.due_date ? (
                <span className={`text-sm ${isOverdue ? "text-red-500 font-medium" : ""}`}>
                  {new Date(currentTask.due_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {isOverdue && " (Overdue)"}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">No due date</span>
              )}
            </div>

            {/* Created */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Created</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(currentTask.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {currentTask.creator && ` by ${currentTask.creator.full_name}`}
              </span>
            </div>
          </div>

          {/* Actions */}
          {canEdit && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
