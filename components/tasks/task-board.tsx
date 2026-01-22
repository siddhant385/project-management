"use client";

import { useState } from "react";
import { Task, TaskStatus, TaskPriority, updateTaskStatus, deleteTask } from "@/actions/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Calendar, 
  Trash2, 
  Edit, 
  GripVertical,
  AlertCircle,
  Clock,
  CheckCircle2,
  Circle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { CreateTaskDialog } from "./create-task-dialog";
import { TaskDetailDialog } from "./task-detail-dialog";

const getInitials = (name: string) => name?.substring(0, 2).toUpperCase() || "U";

// Priority styles
const priorityConfig: Record<TaskPriority, { color: string; icon: React.ReactNode }> = {
  low: { 
    color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    icon: <Circle className="h-3 w-3" />
  },
  medium: { 
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: <Clock className="h-3 w-3" />
  },
  high: { 
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    icon: <AlertCircle className="h-3 w-3" />
  },
  urgent: { 
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    icon: <AlertCircle className="h-3 w-3 fill-current" />
  },
};

// Status column config
const statusConfig: Record<TaskStatus, { title: string; color: string }> = {
  todo: { title: "To Do", color: "bg-slate-500" },
  in_progress: { title: "In Progress", color: "bg-blue-500" },
  review: { title: "Review", color: "bg-yellow-500" },
  completed: { title: "Completed", color: "bg-green-500" },
};

interface TaskBoardProps {
  projectId: string;
  tasks: Task[];
  members: Array<{ user_id: string; profile: { id: string; full_name: string; avatar_url: string | null } }>;
  canEdit: boolean;
}

export function TaskBoard({ projectId, tasks, members, canEdit }: TaskBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Group tasks by status
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    review: tasks.filter((t) => t.status === "review"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      await updateTaskStatus(draggedTask.id, newStatus, 0);
      toast.success(`Task moved to ${statusConfig[newStatus].title}`);
    } catch (error) {
      toast.error("Failed to move task");
    }
    setDraggedTask(null);
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tasks</h3>
          <p className="text-sm text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} • {tasksByStatus.completed.length} completed
          </p>
        </div>
        {canEdit && (
          <CreateTaskDialog projectId={projectId} members={members} />
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(statusConfig) as TaskStatus[]).map((status) => (
          <div
            key={status}
            className="bg-muted/50 rounded-lg p-3 min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${statusConfig[status].color}`} />
              <h4 className="font-medium text-sm">{statusConfig[status].title}</h4>
              <Badge variant="secondary" className="ml-auto text-xs">
                {tasksByStatus[status].length}
              </Badge>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              {tasksByStatus[status].map((task) => (
                <Card
                  key={task.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    draggedTask?.id === task.id ? "opacity-50" : ""
                  }`}
                  draggable={canEdit}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => setSelectedTask(task)}
                >
                  <CardContent className="p-3 space-y-2">
                    {/* Drag Handle & Menu */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        {canEdit && (
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />
                        )}
                        <span className="font-medium text-sm line-clamp-2">{task.title}</span>
                      </div>
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                            }}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(task.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* Priority Badge */}
                    <Badge className={`text-[10px] ${priorityConfig[task.priority].color}`}>
                      {priorityConfig[task.priority].icon}
                      <span className="ml-1 capitalize">{task.priority}</span>
                    </Badge>

                    {/* Footer - Assignee & Due Date */}
                    <div className="flex items-center justify-between pt-1">
                      {task.assignee ? (
                        <div className="flex items-center gap-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={task.assignee.avatar_url || undefined} />
                            <AvatarFallback className="text-[8px]">
                              {getInitials(task.assignee.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                            {task.assignee.full_name.split(" ")[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}

                      {task.due_date && (
                        <div className={`flex items-center gap-1 text-xs ${
                          isOverdue(task.due_date) && task.status !== "completed"
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }`}>
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Empty State */}
              {tasksByStatus[status].length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          members={members}
          canEdit={canEdit}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Edit Task Dialog */}
      {editingTask && (
        <CreateTaskDialog
          projectId={projectId}
          members={members}
          editTask={editingTask}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
