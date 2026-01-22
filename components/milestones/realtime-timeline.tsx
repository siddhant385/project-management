"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Milestone, MilestoneStatus } from "@/actions/milestones";
import { ProjectTimeline } from "./project-timeline";

interface RealtimeTimelineProps {
  projectId: string;
  initialMilestones: Milestone[];
  members: Array<{ 
    user_id: string; 
    profile: { id: string; full_name: string; avatar_url: string | null } 
  }>;
  canEdit: boolean;
}

export function RealtimeTimeline({ 
  projectId, 
  initialMilestones, 
  members, 
  canEdit 
}: RealtimeTimelineProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const supabase = createClient();

  useEffect(() => {
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
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch complete milestone with relations
            const { data } = await supabase
              .from("milestones")
              .select(`
                *,
                assignee:profiles!milestones_assigned_to_fkey(id, full_name, avatar_url)
              `)
              .eq("id", payload.new.id)
              .single();
            
            if (data) {
              // Check for overdue
              const now = new Date();
              const milestone = data as Milestone;
              if (new Date(milestone.due_date) < now && milestone.status !== "completed") {
                milestone.status = "overdue" as MilestoneStatus;
              }
              setMilestones((prev) => [...prev, milestone]);
            }
          } else if (payload.eventType === "UPDATE") {
            // Fetch updated milestone with relations
            const { data } = await supabase
              .from("milestones")
              .select(`
                *,
                assignee:profiles!milestones_assigned_to_fkey(id, full_name, avatar_url)
              `)
              .eq("id", payload.new.id)
              .single();
            
            if (data) {
              const now = new Date();
              const milestone = data as Milestone;
              if (new Date(milestone.due_date) < now && milestone.status !== "completed") {
                milestone.status = "overdue" as MilestoneStatus;
              }
              setMilestones((prev) =>
                prev.map((m) => (m.id === payload.new.id ? milestone : m))
              );
            }
          } else if (payload.eventType === "DELETE") {
            setMilestones((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase]);

  // Update milestones when initialMilestones changes
  useEffect(() => {
    setMilestones(initialMilestones);
  }, [initialMilestones]);

  return (
    <ProjectTimeline
      projectId={projectId}
      milestones={milestones}
      members={members}
      canEdit={canEdit}
    />
  );
}
