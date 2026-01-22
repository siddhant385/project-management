"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

// Hook for realtime task updates
export function useRealtimeTasks(projectId: string) {
  const [tasks, setTasks] = useState<any[]>([]);
  const supabase = createClient();

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
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { tasks, setTasks };
}

// Hook for realtime milestone updates
export function useRealtimeMilestones(projectId: string) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const supabase = createClient();

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

    // Subscribe to realtime changes
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { milestones, setMilestones };
}

// Hook for realtime notifications
export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    };

    fetchNotifications();

    // Subscribe to realtime changes
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
          setNotifications((prev) => [payload.new, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
    
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [userId]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}

// Hook for realtime project activity feed
export function useRealtimeActivity(projectId: string) {
  const [activities, setActivities] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch of recent milestone activities
    const fetchActivities = async () => {
      const { data } = await supabase
        .from("milestone_activities")
        .select(`
          *,
          milestone:milestones!milestone_activities_milestone_id_fkey(id, title, project_id),
          user_profile:profiles!milestone_activities_user_id_fkey(id, full_name, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(20);
      
      // Filter for current project
      const projectActivities = (data || []).filter(
        (a) => a.milestone?.project_id === projectId
      );
      setActivities(projectActivities);
    };

    fetchActivities();

    // Subscribe to new activities
    const channel = supabase
      .channel(`activities:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "milestone_activities",
        },
        async (payload) => {
          // Fetch full activity with relations
          const { data } = await supabase
            .from("milestone_activities")
            .select(`
              *,
              milestone:milestones!milestone_activities_milestone_id_fkey(id, title, project_id),
              user_profile:profiles!milestone_activities_user_id_fkey(id, full_name, avatar_url)
            `)
            .eq("id", payload.new.id)
            .single();
          
          if (data && data.milestone?.project_id === projectId) {
            setActivities((prev) => [data, ...prev].slice(0, 20));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return { activities };
}

// Generic presence hook for showing who's online
export function usePresence(channelName: string, userId: string, userName: string) {
  const [onlineUsers, setOnlineUsers] = useState<Array<{ id: string; name: string }>>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!userId || !userName) return;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.values(state)
          .flat()
          .map((user: any) => ({ id: user.user_id, name: user.user_name }));
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            user_name: userName,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [channelName, userId, userName]);

  return { onlineUsers };
}
