"use server";

import { createClient } from "@/lib/supabase/server";

export interface PublicAnnouncement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "urgent";
  created_at: string;
}

export async function getActiveAnnouncements(): Promise<PublicAnnouncement[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, content, type, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }

  return data || [];
}
