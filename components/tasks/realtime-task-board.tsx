"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Task, TaskStatus } from "@/actions/tasks";
import { TaskBoard } from "./task-board";

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
}

export function RealtimeTaskBoard({ 
  projectId,
  projectTitle,
  projectDescription,
  initialTasks, 
  members, 
  canEdit 
}: RealtimeTaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to realtime changes
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
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch complete task with relations
            const { data } = await supabase
              .from("tasks")
              .select(`
                *,
                assignee:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url),
                creator:profiles!tasks_created_by_fkey(id, full_name)
              `)
              .eq("id", payload.new.id)
              .single();
            
            if (data) {
              setTasks((prev) => [...prev, data as Task]);
            }
          } else if (payload.eventType === "UPDATE") {
            // Fetch updated task with relations
            const { data } = await supabase
              .from("tasks")
              .select(`
                *,
                assignee:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url),
                creator:profiles!tasks_created_by_fkey(id, full_name)
              `)
              .eq("id", payload.new.id)
              .single();
            
            if (data) {
              setTasks((prev) =>
                prev.map((t) => (t.id === payload.new.id ? data as Task : t))
              );
            }
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase]);

  // Update tasks when initialTasks changes (e.g., from server revalidation)
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
    />
  );
}
