"use server";

import { createClient } from "@/lib/supabase/server"; // Apne path ke hisaab se adjust karein (e.g., @/lib/supabase/server)
import { mentorOnboardingSchema, MentorOnboardingValues } from "@/schemas/mentor";
import { redirect } from "next/navigation";

export async function completeMentorOnboarding(data: MentorOnboardingValues) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "User not authenticated" };
  }

  const validatedFields = mentorOnboardingSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid fields provided" };
  }

  // Mentor specific fields update
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      department: data.department,
      // Mentor ke paas roll no/year nahi, skills hain:
      skills: data.skills.split(",").map((s) => s.trim()), // Comma string ko Array bana diya
      bio: data.bio,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Mentor Update Error:", updateError);
    return { error: "Failed to update profile." };
  }

  redirect("/mentor");
}