"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type MilestoneStatus = "pending" | "in_progress" | "completed" | "overdue";

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: MilestoneStatus;
  progress: number;
  assigned_to: string | null;
  created_by: string;
  completed_at: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export interface MilestoneActivity {
  id: string;
  milestone_id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: any;
  created_at: string;
  user_profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

// Get all milestones for a project
export async function getProjectMilestones(projectId: string): Promise<Milestone[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("milestones")
    .select(`
      *,
      assignee:profiles!milestones_assigned_to_fkey(id, full_name, avatar_url)
    `)
    .eq("project_id", projectId)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching milestones:", error);
    return [];
  }

  // Check for overdue milestones
  const now = new Date();
  return (data || []).map((m) => {
    if (new Date(m.due_date) < now && m.status !== "completed") {
      return { ...m, status: "overdue" as MilestoneStatus };
    }
    return m;
  });
}

// Create a new milestone
export async function createMilestone(data: {
  project_id: string;
  title: string;
  description?: string | null;
  due_date: string;
  assigned_to?: string | null;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get max position
  const { data: maxPos } = await supabase
    .from("milestones")
    .select("position")
    .eq("project_id", data.project_id)
    .order("position", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase.from("milestones").insert({
    ...data,
    assigned_to: data.assigned_to === "unassigned" ? null : data.assigned_to,
    created_by: user.id,
    position: (maxPos?.position || 0) + 1,
  });

  if (error) {
    console.error("Error creating milestone:", error);
    throw new Error("Failed to create milestone");
  }

  // Note: revalidatePath removed - using realtime updates instead
}

// Update milestone
export async function updateMilestone(
  milestoneId: string,
  data: {
    title?: string;
    description?: string | null;
    due_date?: string;
    assigned_to?: string | null;
    status?: MilestoneStatus;
  }
) {
  const supabase = await createClient();

  const updateData = {
    ...data,
    assigned_to: data.assigned_to === "unassigned" ? null : data.assigned_to,
  };

  const { data: milestone, error } = await supabase
    .from("milestones")
    .update(updateData)
    .eq("id", milestoneId)
    .select("project_id")
    .single();

  if (error) {
    console.error("Error updating milestone:", error);
    throw new Error("Failed to update milestone");
  }

  // Note: revalidatePath removed - using realtime updates instead
}

// Update milestone progress
export async function updateMilestoneProgress(
  milestoneId: string,
  progress: number
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: milestone, error } = await supabase
    .from("milestones")
    .update({ progress })
    .eq("id", milestoneId)
    .select("project_id, title")
    .single();

  if (error) {
    console.error("Error updating progress:", error);
    throw new Error("Failed to update progress");
  }

  // Log activity
  await supabase.from("milestone_activities").insert({
    milestone_id: milestoneId,
    user_id: user.id,
    activity_type: progress === 100 ? "completion" : "progress_update",
    description:
      progress === 100
        ? `Completed milestone "${milestone.title}"`
        : `Updated progress to ${progress}%`,
    metadata: { progress },
  });

  // Note: revalidatePath removed - using realtime updates instead
}

// Update milestone status
export async function updateMilestoneStatus(
  milestoneId: string,
  status: MilestoneStatus
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get milestone with project info to check permissions
  const { data: milestone, error: fetchError } = await supabase
    .from("milestones")
    .select(`
      *,
      project:projects(id, initiator_id, final_mentor_id)
    `)
    .eq("id", milestoneId)
    .single();

  if (fetchError || !milestone) throw new Error("Milestone not found");

  // Check if user is project owner or mentor
  const isOwner = milestone.project?.initiator_id === user.id;
  const isMentor = milestone.project?.final_mentor_id === user.id;

  if (!isOwner && !isMentor) {
    throw new Error("You don't have permission to update this milestone");
  }

  const statusLabels: Record<MilestoneStatus, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    overdue: "Overdue",
  };

  // Update milestone status
  const updateData: any = { status };
  
  // If completing, set completed_at and progress to 100
  if (status === "completed") {
    updateData.completed_at = new Date().toISOString();
    updateData.progress = 100;
  } else if (status === "pending") {
    // If setting back to pending, reset completed_at
    updateData.completed_at = null;
  }

  const { error } = await supabase
    .from("milestones")
    .update(updateData)
    .eq("id", milestoneId);

  if (error) {
    console.error("Error updating milestone status:", error);
    throw new Error("Failed to update milestone status");
  }

  // Log activity
  await supabase.from("milestone_activities").insert({
    milestone_id: milestoneId,
    user_id: user.id,
    activity_type: "status_change",
    description: `Changed status to "${statusLabels[status]}"`,
    metadata: { old_status: milestone.status, new_status: status },
  });

  // Note: revalidatePath removed - using realtime updates instead
  return { success: true };
}

// Delete milestone
export async function deleteMilestone(milestoneId: string) {
  const supabase = await createClient();

  const { data: milestone, error: fetchError } = await supabase
    .from("milestones")
    .select("project_id")
    .eq("id", milestoneId)
    .single();

  if (fetchError) throw new Error("Milestone not found");

  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", milestoneId);

  if (error) {
    console.error("Error deleting milestone:", error);
    throw new Error("Failed to delete milestone");
  }

  // Note: revalidatePath removed - using realtime updates instead
}

// Get milestone activities
export async function getMilestoneActivities(
  milestoneId: string
): Promise<MilestoneActivity[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("milestone_activities")
    .select(
      `
      *,
      user_profile:profiles!milestone_activities_user_id_fkey(id, full_name, avatar_url)
    `
    )
    .eq("milestone_id", milestoneId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching activities:", error);
    return [];
  }

  return data || [];
}

// Add activity/comment to milestone
export async function addMilestoneActivity(
  milestoneId: string,
  data: {
    activity_type: string;
    description: string;
    metadata?: any;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("milestone_activities").insert({
    milestone_id: milestoneId,
    user_id: user.id,
    ...data,
  });

  if (error) {
    console.error("Error adding activity:", error);
    throw new Error("Failed to add activity");
  }
}

// Get timeline stats for a project
export async function getTimelineStats(projectId: string) {
  const supabase = await createClient();

  const { data: milestones, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", projectId);

  if (error || !milestones) {
    return {
      total_milestones: 0,
      completed_milestones: 0,
      in_progress_milestones: 0,
      overdue_milestones: 0,
      overall_progress: 0,
      upcoming_deadlines: [],
      recent_completions: [],
    };
  }

  const now = new Date();

  const completed = milestones.filter((m) => m.status === "completed");
  const inProgress = milestones.filter((m) => m.status === "in_progress");
  const overdue = milestones.filter(
    (m) => new Date(m.due_date) < now && m.status !== "completed"
  );

  // Upcoming deadlines (next 14 days, not completed)
  const upcoming = milestones
    .filter((m) => {
      const dueDate = new Date(m.due_date);
      const daysUntil = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil >= 0 && daysUntil <= 14 && m.status !== "completed";
    })
    .map((m) => ({
      id: m.id,
      title: m.title,
      due_date: m.due_date,
      days_until_due: Math.ceil(
        (new Date(m.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => a.days_until_due - b.days_until_due);

  // Recent completions
  const recentCompletions = completed
    .filter((m) => m.completed_at)
    .sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() -
        new Date(a.completed_at!).getTime()
    )
    .slice(0, 3)
    .map((m) => ({
      id: m.id,
      title: m.title,
      completed_at: m.completed_at,
    }));

  // Overall progress (average of all milestones)
  const overallProgress =
    milestones.length > 0
      ? Math.round(
          milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length
        )
      : 0;

  return {
    total_milestones: milestones.length,
    completed_milestones: completed.length,
    in_progress_milestones: inProgress.length,
    overdue_milestones: overdue.length,
    overall_progress: overallProgress,
    upcoming_deadlines: upcoming,
    recent_completions: recentCompletions,
  };
}
