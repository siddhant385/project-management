"use client";

import { useEffect, useState, useCallback } from "react"; // 👈 useCallback add kiya
import { createClient } from "@/lib/supabase/client";
import { Task } from "@/actions/tasks";
import { TaskBoard } from "./task-board";
import { useRouter } from "next/navigation"; // 👈 useRouter add kiya

interface RealtimeTaskBoardProps {
  projectId: string;
  projectTitle?: string;
  projectDescription?: string;
  initialTasks: Task[];
  members: Array<{ 
    user_id: string; 
    profile: { id: string; full_name: string; avatar_url: string | null } 
  }>;
  canEdit: boolean;
  milestones: Array<{ id: string; title: string; description: string | null }>;
}

export function RealtimeTaskBoard({ 
  projectId,
  projectTitle,
  projectDescription,
  initialTasks, 
  members, 
  canEdit,
  milestones 
}: RealtimeTaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const supabase = createClient();
  const router = useRouter(); // 👈 Router initialize kiya

  // 1. Data Refresh Function (Sabse important)
  const refreshTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url),
        creator:profiles!tasks_created_by_fkey(id, full_name)
      `)
      .eq("project_id", projectId)
      .order("position", { ascending: true });
    
    if (data) {
      setTasks(data as Task[]);
      router.refresh(); // Server components ko bhi fresh rakho
    }
  }, [projectId, supabase, router]);

  // 2. Focus Handler (Jab user tab par wapas aaye)
  useEffect(() => {
    const onFocus = () => {
      refreshTasks();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshTasks]);

  // 3. Realtime Subscription (Simplified)
  useEffect(() => {
    const channel = supabase
      .channel(`tasks:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          // ⚡ Logic: Kuch bhi change hua (Insert/Update/Delete), bas fresh data le aao.
          // Ye 100% accurate hota hai aur manual merging ke bugs se bachaata hai.
          refreshTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase, refreshTasks]);

  // Initial props update
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  return (
    <TaskBoard
      projectId={projectId}
      projectTitle={projectTitle}
      projectDescription={projectDescription}
      tasks={tasks}
      members={members}
      canEdit={canEdit}
      milestones={milestones}
    />
  );
}