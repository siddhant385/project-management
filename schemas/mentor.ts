import { z } from "zod/v4";

export const mentorOnboardingSchema = z.object({
  full_name: z.string().min(2, { 
    error: "Name must be greater than 2 characters." 
  }),
  
  department: z.enum(["CSE", "ECE", "ME", "CE", "IT", "AIDS", "EE","MECH", "IP", "MATH", "CHEM", "PHY", "T&P"], {
    error: "Its compulsory to select the department.",
  }),

  // Mentors ke liye hum skills pooch sakte hain (comma separated)
  skills: z.string().min(3, {
    error: "Please tell at least 1 skill which should be greater than 2 characters."
  }),

  bio: z.string().min(10, {
    error: "Please tell us about your experience in detail."
  }).max(1000, { error: "Bio is too long" }).optional(),
});

export type MentorOnboardingValues = z.infer<typeof mentorOnboardingSchema>;