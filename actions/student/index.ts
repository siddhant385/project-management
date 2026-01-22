"use server";

import { createClient } from "@/lib/supabase/server"; // Apne path ke hisaab se adjust karein (e.g., @/lib/supabase/server)
import { studentOnboardingSchema, StudentOnboardingValues } from "@/schemas/student";
import { redirect } from "next/navigation";

export async function completeStudentOnboarding(data: StudentOnboardingValues) {
  // 1. Database Connection Banao
  const supabase = await createClient();

  // 2. Check karo user kon hai
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "User not authenticated" };
  }

  // 3. Server-side Validation (Double security)
  const validatedFields = studentOnboardingSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid fields provided" };
  }

  // 4. Database Update
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      department: data.department,
      admission_year: data.admission_year,
      roll_number: data.roll_number,
      bio: data.bio,
      onboarding_completed: true, // Ab ye user dashboard dekh payega
    })
    .eq("id", user.id); // Sirf apni profile update karega

  if (updateError) {
    console.error("Profile Update Error:", updateError);
    return { error: "Failed to update profile. Please try again." };
  }

  // 5. Redirect to Student Dashboard
  // Redirect hamesha try-catch ke bahar ya last mein hona chahiye
  redirect("/student");
}