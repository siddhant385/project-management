"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation"; // 👈 Router import kiya

// Hook for realtime task updates
export function useRealtimeTasks(projectId: string) {
  const [tasks, setTasks] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter(); // 👈 Router initialize

  // Refresh helper
  const refreshData = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    // Initial fetch
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select(`
          *,
          assignee:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url),
          creator:profiles!tasks_created_by_fkey(id, full_name)
        `)
        .eq("project_id", projectId)
        .order("position", { ascending: true });
      
      if (data) setTasks(data);
    };

    fetchTasks();

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
          // Update Local State for instant feedback
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
          
          // ⚡ Background Refresh (Taaki server data sync rahe)
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, refreshData]);

  return { tasks, setTasks };
}

// Hook for realtime milestone updates
export function useRealtimeMilestones(projectId: string) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Initial fetch
    const fetchMilestones = async () => {
      const { data } = await supabase
        .from("milestones")
        .select(`
          *,
          assignee:profiles!milestones_assigned_to_fkey(id, full_name, avatar_url)
        `)
        .eq("project_id", projectId)
        .order("due_date", { ascending: true });
      
      if (data) setMilestones(data);
    };

    fetchMilestones();

    const channel = supabase
      .channel(`milestones:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "milestones",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMilestones((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setMilestones((prev) =>
              prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m))
            );
          } else if (payload.eventType === "DELETE") {
            setMilestones((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
          router.refresh(); // ⚡ Refresh
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, router]);

  return { milestones, setMilestones };
}

// Hook for realtime notifications
export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          if (!newNotif.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
          router.refresh(); // ⚡ Refresh to show notification everywhere
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  const markAsRead = useCallback(async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
    
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    router.refresh();
  }, [router]);

  const markAllAsRead = useCallback(async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    router.refresh();
  }, [userId, router]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}

// Hook for realtime applications (Requests) - THIS ONE FIXES YOUR ISSUE
// realtime.ts

// ... baki imports same ...

export function useRealtimeApplications(projectId: string, initialData: any[] = []) {
  const [applications, setApplications] = useState<any[]>(initialData);
  const supabase = createClient();
  const router = useRouter();

  // 1. Sync with Server Data (Jab page refresh ho)
  useEffect(() => {
    setApplications(initialData);
  }, [initialData]);

  // 2. Fetch Fresh Data on Mount (Ye wala part missing tha!) [Cite: realtime.ts]
  useEffect(() => {
    const fetchApplications = async () => {
      const { data } = await supabase
        .from("project_applications")
        .select(`
          *,
          applicant:profiles!project_applications_applicant_id_fkey(full_name, avatar_url, roll_number, skills)
        `)
        .eq("project_id", projectId);
      
      if (data) {
        setApplications(data);
      }
    };

    fetchApplications();
  }, [projectId]);

  // 3. Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel(`applications:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_applications",
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data: newApp } = await supabase
              .from("project_applications")
              .select(`
                *,
                applicant:profiles!project_applications_applicant_id_fkey(full_name, avatar_url, roll_number, skills)
              `)
              .eq("id", payload.new.id)
              .single();

            if (newApp) {
              setApplications((prev) => [newApp, ...prev]);
            }
          } 
          else if (payload.eventType === "UPDATE") {
            setApplications((prev) =>
              prev.map((app) => 
                app.id === payload.new.id ? { ...app, ...payload.new } : app
              )
            );
          } 
          else if (payload.eventType === "DELETE") {
            setApplications((prev) => 
              prev.filter((app) => app.id !== payload.old.id)
            );
          }

          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, router]);

  return { applications };
}