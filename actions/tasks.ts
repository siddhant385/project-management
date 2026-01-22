"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TaskStatus = "todo" | "in_progress" | "review" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  created_by: string;
  due_date: string | null;
  completed_at: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  creator?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

// Get all tasks for a project
export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:profiles!assigned_to(id, full_name, avatar_url),
      creator:profiles!created_by(id, full_name, avatar_url)
    `)
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data || [];
}

// Get single task
export async function getTask(taskId: string): Promise<Task | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:profiles!assigned_to(id, full_name, avatar_url),
      creator:profiles!created_by(id, full_name, avatar_url)
    `)
    .eq("id", taskId)
    .single();

  if (error) return null;
  return data;
}

// Create a new task
export async function createTask(
  projectId: string,
  data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigned_to?: string | null;
    due_date?: string | null;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get max position for the status column
  const { data: maxPosData } = await supabase
    .from("tasks")
    .select("position")
    .eq("project_id", projectId)
    .eq("status", data.status || "todo")
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const newPosition = (maxPosData?.position || 0) + 1;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title: data.title,
      description: data.description || null,
      status: data.status || "todo",
      priority: data.priority || "medium",
      assigned_to: data.assigned_to || null,
      due_date: data.due_date || null,
      created_by: user.id,
      position: newPosition,
    })
    .select()
    .single();

  if (error) throw new Error("Failed to create task");

  revalidatePath(`/projects/${projectId}`);
  return task;
}

// Update a task
export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigned_to?: string | null;
    due_date?: string | null;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get current task to find project_id
  const { data: currentTask } = await supabase
    .from("tasks")
    .select("project_id")
    .eq("id", taskId)
    .single();

  if (!currentTask) throw new Error("Task not found");

  const { error } = await supabase
    .from("tasks")
    .update(data)
    .eq("id", taskId);

  if (error) throw new Error("Failed to update task");

  revalidatePath(`/projects/${currentTask.project_id}`);
}

// Update task status (for drag & drop)
export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  newPosition: number
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get current task
  const { data: currentTask } = await supabase
    .from("tasks")
    .select("project_id, status, position")
    .eq("id", taskId)
    .single();

  if (!currentTask) throw new Error("Task not found");

  const projectId = currentTask.project_id;

  // Update positions of other tasks in the new column
  if (currentTask.status !== newStatus) {
    // Moving to a different column - shift tasks in new column down
    await supabase
      .from("tasks")
      .update({ position: supabase.rpc("increment_position") })
      .eq("project_id", projectId)
      .eq("status", newStatus)
      .gte("position", newPosition);
  }

  // Update the task
  const { error } = await supabase
    .from("tasks")
    .update({ status: newStatus, position: newPosition })
    .eq("id", taskId);

  if (error) throw new Error("Failed to update task status");

  revalidatePath(`/projects/${projectId}`);
}

// Delete a task
export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get project_id first
  const { data: task } = await supabase
    .from("tasks")
    .select("project_id")
    .eq("id", taskId)
    .single();

  if (!task) throw new Error("Task not found");

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw new Error("Failed to delete task");

  revalidatePath(`/projects/${task.project_id}`);
}

// Get task stats for a project
export async function getTaskStats(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("status")
    .eq("project_id", projectId);

  if (error || !data) {
    return { todo: 0, in_progress: 0, review: 0, completed: 0, total: 0 };
  }

  const stats = {
    todo: data.filter((t) => t.status === "todo").length,
    in_progress: data.filter((t) => t.status === "in_progress").length,
    review: data.filter((t) => t.status === "review").length,
    completed: data.filter((t) => t.status === "completed").length,
    total: data.length,
  };

  return stats;
}

// Add comment to task
export async function addTaskComment(taskId: string, content: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: task } = await supabase
    .from("tasks")
    .select("project_id")
    .eq("id", taskId)
    .single();

  if (!task) throw new Error("Task not found");

  const { error } = await supabase.from("task_comments").insert({
    task_id: taskId,
    user_id: user.id,
    content,
  });

  if (error) throw new Error("Failed to add comment");

  revalidatePath(`/projects/${task.project_id}`);
}

// Get task comments
export async function getTaskComments(taskId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("task_comments")
    .select(`
      *,
      user:profiles!user_id(id, full_name, avatar_url)
    `)
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data || [];
}
