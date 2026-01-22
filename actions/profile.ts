"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { deleteFile } from "@/actions/storage"; 
import { profileSchema, ProfileFormValues } from "@/schemas/profile"; 

// Helper: URL se path nikalne ke liye
function getPathFromUrl(url: string) {
  const parts = url.split("/public/avatars/");
  if (parts.length > 1) return parts[1];
  return null;
}

// ---------------------------------------------------------
// 1. UPDATE PROFILE
// ---------------------------------------------------------
export async function updateProfile(data: ProfileFormValues, avatarUrl: string | null) {
  const supabase = await createClient();
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 2. Validation
  const validatedFields = profileSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: "Invalid data!", details: validatedFields.error.flatten().fieldErrors };
  }

  // 3. Image Cleanup (Purani photo delete karna)
  const { data: oldProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (avatarUrl && oldProfile?.avatar_url && avatarUrl !== oldProfile.avatar_url) {
    const oldPath = getPathFromUrl(oldProfile.avatar_url);
    if (oldPath) await deleteFile("avatars", oldPath);
  }

  // 4. Data Preparation
  const { full_name, bio, contact_info, department, roll_number, admission_year, skills } = validatedFields.data;

  // 🔥 IMPORTANT FIX HERE:
  // Hum 'updateData' direct bana rahe hain. 
  // Agar value defined hai to update hogi, agar empty hai to null/empty jayegi.
  
  const updateData: any = {
    full_name,
    bio,
    contact_info,
    department,
    avatar_url: avatarUrl || oldProfile?.avatar_url,
    updated_at: new Date().toISOString(),
    
    // Fix: Agar roll number empty string hai, to use null bhejo ya empty string
    roll_number: roll_number || null, 
    
    // Fix: Admission year agar undefined/0 hai to null
    admission_year: admission_year || null,
    
    // Fix: Skills string ko array banana (aur empty string ko empty array)
    skills: skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [],
  };

  // 5. Database Update
  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    console.error("Profile Update Error:", error);
    return { error: "Failed to update profile" };
  }

  revalidatePath("/profile");
  return { success: "Profile updated successfully!" };
}

// ---------------------------------------------------------
// 2. GET PROFILE (Edit Page)
// ---------------------------------------------------------
export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
   
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
    
  // Agar profile nahi bani (first login), to basic user info return kro
  if (!data) {
    return { 
        id: user.id, 
        email: user.email, 
        full_name: user.user_metadata?.full_name || "",
        role: "student" // Default fallback
    };
  }

  return { ...data, email: user.email }; 
}

// ---------------------------------------------------------
// 3. GET PROFILE BY ID (Public View)
// ---------------------------------------------------------
export async function getProfileById(userId: string) {
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) return null;
  
  return profile;
}