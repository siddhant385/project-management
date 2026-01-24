"use server";

import { createClient } from "@/lib/supabase/server";

// 1. Interface ko Schema ke 'priority' values se match kiya
export interface PublicAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: "low" | "normal" | "high"; // <-- Schema match
  created_at: string;
}

export async function getActiveAnnouncements(): Promise<PublicAnnouncement[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, content, priority, created_at") // <-- 'type' ki jagah 'priority'
    .eq("is_active", true)
    // 2. Extra Safety: Sirf wo dikhao jo expire nahi hui hain (ya jinka expiry NULL hai)
    .or(`expires_at.is.null,expires_at.gt.${now}`) 
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }

  // TypeScript ko khush karne ke liye data cast kar rahe hain
  return (data as PublicAnnouncement[]) || [];
}