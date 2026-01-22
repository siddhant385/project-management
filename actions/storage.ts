"use server";

import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid"; // Unique name ke liye (npm install uuid @types/uuid)

/**
 * Generic File Upload Action
 * @param formData - Form data jisme 'file' aur 'bucket' hoga
 */
export async function uploadFile(formData: FormData) {
  const supabase = await createClient();

  // 1. User Authentication Check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Unauthorized access" };
  }

  // 2. Data Extract karo
  const file = formData.get("file") as File;
  const bucket = formData.get("bucket") as string; // 'avatars' ya 'documents'
  const folder = formData.get("folder") as string; // Optional: e.g., 'research-papers'

  if (!file) {
    return { error: "No file found" };
  }

  // 3. Unique Filename Banao (Collision na ho)
  // e.g., user_123/research-paper-uuid.pdf
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // 4. Supabase Storage me Upload karo
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false, // Overwrite na kare
    });

  if (error) {
    console.error("Upload Error:", error);
    return { error: "File upload failed" };
  }

  // 5. Public URL Generate karo
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { success: true, url: publicUrl, path: filePath };
}

/**
 * Delete File Action (Optional Utility)
 */
export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) return { error: error.message };
  return { success: true };
}