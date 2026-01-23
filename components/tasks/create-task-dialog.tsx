"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Task, TaskStatus, TaskPriority, createTask, updateTask } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Plus, Calendar } from "lucide-react";

const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || "U";

interface CreateTaskDialogProps {
  projectId: string;
  members: Array<{
    user_id: string;
    profile: { id: string; full_name: string; avatar_url: string | null };
  }>;
  editTask?: Task | null;
  open?: boolean;
  onClose?: () => void;
}

interface FormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string;
  due_date: string;
}

export function CreateTaskDialog({
  projectId,
  members,
  editTask,
  open: controlledOpen,
  onClose,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assigned_to: "",
      due_date: "",
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editTask) {
      setValue("title", editTask.title);
      setValue("description", editTask.description || "");
      setValue("status", editTask.status);
      setValue("priority", editTask.priority);
      setValue("assigned_to", editTask.assigned_to || "");
      setValue("due_date", editTask.due_date ? editTask.due_date.split("T")[0] : "");
    }
  }, [editTask, setValue]);

  const handleClose = () => {
    if (isControlled) {
      onClose?.();
    } else {
      setOpen(false);
    }
    reset();
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const taskData = {
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        priority: data.priority,
        assigned_to: data.assigned_to || null,
        due_date: data.due_date || null,
      };

      if (editTask) {
        await updateTask(editTask.id, taskData);
        toast.success("Task updated!");
      } else {
        await createTask(projectId, taskData);
        toast.success("Task created!");
      }
      handleClose();
    } catch (error) {
      toast.error(editTask ? "Failed to update task" : "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const status = watch("status");
  const priority = watch("priority");
  const assignedTo = watch("assigned_to");

  const content = (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{editTask ? "Edit Task" : "Create New Task"}</DialogTitle>
        <DialogDescription>
          {editTask ? "Update the task details below." : "Add a new task to your project."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="Enter task title"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the task..."
            rows={3}
            {...register("description")}
          />
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setValue("status", v as TaskStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setValue("priority", v as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Assignee */}
        <div className="space-y-2">
          <Label>Assign To</Label>
          <Select value={assignedTo || "unassigned"} onValueChange={(v) => setValue("assigned_to", v === "unassigned" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  <div className="flex items-center gap-2">
                    <UserAvatar 
                      src={member.profile.avatar_url} 
                      name={member.profile.full_name}
                      size="xs"
                    />
                    {member.profile.full_name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="due_date"
              type="date"
              className="pl-9"
              {...register("due_date")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : editTask ? "Update Task" : "Create Task"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  // Controlled mode (for editing)
  if (isControlled) {
    return (
      <Dialog open={isOpen} onOpenChange={(v) => !v && handleClose()}>
        {content}
      </Dialog>
    );
  }

  // Uncontrolled mode (for creating)
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  );
}
