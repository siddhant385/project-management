"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type UserRole = "student" | "mentor" | "admin";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  department: string | null;
  is_banned: boolean;
  created_at: string;
  onboarding_completed: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalMentors: number;
  totalAdmins: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingProjects: number;
  totalTasks: number;
  completedTasks: number;
  newUsersThisMonth: number;
  newProjectsThisMonth: number;
}

// ---------------------------------------------------------
// 1. CHECK IF USER IS ADMIN
// ---------------------------------------------------------
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
    
  return profile?.role === "admin";
}

// ---------------------------------------------------------
// 2. GET ADMIN STATS
// ---------------------------------------------------------
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  
  // Check admin access
  if (!(await isAdmin())) {
    throw new Error("Unauthorized: Admin access required");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Parallel queries for better performance
  const [
    usersResult,
    studentsResult,
    mentorsResult,
    adminsResult,
    projectsResult,
    activeProjectsResult,
    completedProjectsResult,
    pendingProjectsResult,
    tasksResult,
    completedTasksResult,
    newUsersResult,
    newProjectsResult,
  ] = await Promise.all([
    // Total Users
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    // Students
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    // Mentors
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "mentor"),
    // Admins
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    // Total Projects
    supabase.from("projects").select("*", { count: "exact", head: true }),
    // Active Projects
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    // Completed Projects
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "completed"),
    // Pending Projects
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "pending"),
    // Total Tasks
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    // Completed Tasks
    supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "completed"),
    // New Users This Month
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
    // New Projects This Month
    supabase.from("projects").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
  ]);

  return {
    totalUsers: usersResult.count || 0,
    totalStudents: studentsResult.count || 0,
    totalMentors: mentorsResult.count || 0,
    totalAdmins: adminsResult.count || 0,
    totalProjects: projectsResult.count || 0,
    activeProjects: activeProjectsResult.count || 0,
    completedProjects: completedProjectsResult.count || 0,
    pendingProjects: pendingProjectsResult.count || 0,
    totalTasks: tasksResult.count || 0,
    completedTasks: completedTasksResult.count || 0,
    newUsersThisMonth: newUsersResult.count || 0,
    newProjectsThisMonth: newProjectsResult.count || 0,
  };
}

// ---------------------------------------------------------
// 3. GET ALL USERS
// ---------------------------------------------------------
export async function getAllUsers(
  page: number = 1,
  limit: number = 10,
  roleFilter?: UserRole,
  searchQuery?: string
): Promise<{ users: AdminUser[]; total: number }> {
  const supabase = await createClient();
  
  // Check admin access
  if (!(await isAdmin())) {
    throw new Error("Unauthorized: Admin access required");
  }

  const offset = (page - 1) * limit;

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, department, is_banned, created_at, onboarding_completed", { count: "exact" });

  // Apply role filter
  if (roleFilter) {
    query = query.eq("role", roleFilter);
  }

  // Apply search filter
  if (searchQuery) {
    query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
  }

  // Pagination and ordering
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }

  return {
    users: (data as AdminUser[]) || [],
    total: count || 0,
  };
}

// ---------------------------------------------------------
// 4. CHANGE USER ROLE
// ---------------------------------------------------------
export async function changeUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient();
  
  // Check admin access
  if (!(await isAdmin())) {
    return { error: "Unauthorized: Admin access required" };
  }

  // Get current admin user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Prevent self-demotion
  if (user?.id === userId && newRole !== "admin") {
    return { error: "Cannot change your own role" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Error changing role:", error);
    return { error: "Failed to change user role" };
  }

  revalidatePath("/admin");
  return { success: `User role changed to ${newRole}` };
}

// ---------------------------------------------------------
// 5. BAN/UNBAN USER
// ---------------------------------------------------------
export async function toggleUserBan(
  userId: string,
  isBanned: boolean
): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient();
  
  // Check admin access
  if (!(await isAdmin())) {
    return { error: "Unauthorized: Admin access required" };
  }

  // Get current admin user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Prevent self-ban
  if (user?.id === userId) {
    return { error: "Cannot ban yourself" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: isBanned, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Error toggling ban:", error);
    return { error: "Failed to update user status" };
  }

  revalidatePath("/admin");
  return { success: isBanned ? "User has been banned" : "User has been unbanned" };
}

// ---------------------------------------------------------
// 6. DELETE USER
// ---------------------------------------------------------
export async function deleteUser(
  userId: string
): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient();
  
  // ⚠️ SECURITY: Check admin access FIRST before using service key
  if (!(await isAdmin())) {
    return { error: "Unauthorized: Admin access required" };
  }

  // Get current admin user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Prevent self-deletion
  if (user?.id === userId) {
    return { error: "Cannot delete yourself" };
  }

  try {
    // Use admin client to delete from auth.users (requires service role key)
    // This is safe because we already verified isAdmin() above
    const adminClient = createAdminClient();
    
    // Delete from auth.users table (this will cascade delete profile if ON DELETE CASCADE is set)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting user from auth:", authError);
      return { error: "Failed to delete user" };
    }

    revalidatePath("/admin");
    return { success: "User deleted successfully" };
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return { error: "Failed to delete user. Make sure SUPABASE_SERVICE_ROLE_KEY is set." };
  }
}

// ---------------------------------------------------------
// 7. GET RECENT ACTIVITY
// ---------------------------------------------------------
export async function getRecentActivity(limit: number = 10) {
  const supabase = await createClient();
  
  // Check admin access
  if (!(await isAdmin())) {
    throw new Error("Unauthorized: Admin access required");
  }

  // Get recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Get recent projects
  const { data: recentProjects } = await supabase
    .from("projects")
    .select("id, title, status, created_at, initiator:profiles!initiator_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return {
    recentUsers: recentUsers || [],
    recentProjects: recentProjects || [],
  };
}

// ---------------------------------------------------------
// 8. GET ALL PROJECTS (Admin)
// ---------------------------------------------------------
export interface AdminProject {
  id: string;
  title: string;
  description: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  initiator: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  _count?: {
    applications: number;
    tasks: number;
  };
}

export async function getAllProjects(
  page: number = 1,
  limit: number = 10,
  statusFilter?: string,
  searchQuery?: string
): Promise<{ projects: AdminProject[]; total: number }> {
  const supabase = await createClient();
  
  if (!(await isAdmin())) {
    throw new Error("Unauthorized: Admin access required");
  }

  const offset = (page - 1) * limit;

  let query = supabase
    .from("projects")
    .select(`
      id, title, description, status, is_featured, created_at,
      initiator:profiles!initiator_id(id, full_name, email)
    `, { count: "exact" });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects");
  }

  return {
    projects: (data as unknown as AdminProject[]) || [],
    total: count || 0,
  };
}

// ---------------------------------------------------------
// 9. TOGGLE PROJECT FEATURED
// ---------------------------------------------------------
export async function toggleProjectFeatured(
  projectId: string,
  isFeatured: boolean
): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient();
  
  if (!(await isAdmin())) {
    return { error: "Unauthorized: Admin access required" };
  }

  const { error } = await supabase
    .from("projects")
    .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (error) {
    console.error("Error toggling featured:", error);
    return { error: "Failed to update project" };
  }

  revalidatePath("/admin");
  revalidatePath("/projects");
  return { success: isFeatured ? "Project is now featured" : "Project removed from featured" };
}

// ---------------------------------------------------------
// 10. CHANGE PROJECT STATUS
// ---------------------------------------------------------
export async function changeProjectStatus(
  projectId: string,
  newStatus: string
): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient();
  
  if (!(await isAdmin())) {
    return { error: "Unauthorized: Admin access required" };
  }

  const { error } = await supabase
    .from("projects")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (error) {
    console.error("Error changing status:", error);
    return { error: "Failed to update project status" };
  }

  revalidatePath("/admin");
  revalidatePath("/projects");
  return { success: `Project status changed to ${newStatus}` };
}

// ---------------------------------------------------------
// 11. DELETE PROJECT
// ---------------------------------------------------------
export async function deleteProject(
  projectId: string
): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient();
  
  if (!(await isAdmin())) {
    return { error: "Unauthorized: Admin access required" };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("Error deleting project:", error);
    return { error: "Failed to delete project" };
  }

  revalidatePath("/admin");
  revalidatePath("/projects");
  return { success: "Project deleted successfully" };
}

// ---------------------------------------------------------
// 12. GET ANNOUNCEMENTS
// ---------------------------------------------------------
export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  priority: "low" | "normal" | "high";
  created_at: string;
  expires_at: string | null;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }

  return (data as Announcement[]) || [];
}

// ---------------------------------------------------------
// 13. CREATE ANNOUNCEMENT
// ---------------------------------------------------------
export async function createAnnouncement(data: {
  title: string;
  content: string;
  priority: "low" | "normal" | "high";
  expires_at?: string;
}): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient();
  
  if (!(await isAdmin())) {
    return { error: "Unauthorized: Admin access required" };
  }

  const { error } = await supabase
    .from("announcements")
    .insert({
      title: data.title,
      content: data.content,
      priority: data.priority,
      is_active: true,
      expires_at: data.expires_at || null,
    });

  if (error) {
    console.error("Error creating announcement:", error);
    return { error: "Failed to create announcement" };
  }

  revalidatePath("/admin");
  return { success: "Announcement created successfully" };
}

// ---------------------------------------------------------
// 14. TOGGLE ANNOUNCEMENT
// ---------------------------------------------------------
export async function toggleAnnouncement(
  announcementId: string,
  isActive: boolean
): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient();
  
  if (!(await isAdmin())) {
    return { error: "Unauthorized: Admin access required" };
  }

  const { error } = await supabase
    .from("announcements")
    .update({ is_active: isActive })
    .eq("id", announcementId);

  if (error) {
    console.error("Error toggling announcement:", error);
    return { error: "Failed to update announcement" };
  }

  revalidatePath("/admin");
  return { success: isActive ? "Announcement activated" : "Announcement deactivated" };
}

// ---------------------------------------------------------
// 15. DELETE ANNOUNCEMENT
// ---------------------------------------------------------
export async function deleteAnnouncement(
  announcementId: string
): Promise<{ success?: string; error?: string }> {
  const supabase = await createClient();
  
  if (!(await isAdmin())) {
    return { error: "Unauthorized: Admin access required" };
  }

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) {
    console.error("Error deleting announcement:", error);
    return { error: "Failed to delete announcement" };
  }

  revalidatePath("/admin");
  return { success: "Announcement deleted successfully" };
}