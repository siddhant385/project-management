import { z } from "zod";

export const mentorOnboardingSchema = z.object({
  full_name: z.string().min(2, { 
    message: "Name must be greater than 2 characters." 
  }),
  
  department: z.enum(["CSE", "ECE", "ME", "CE", "IT", "AIDS", "EE","MECH", "IP", "MATH", "CHEM", "PHY", "T&P"], {
    required_error: "Its compulsory to select the department.",
  }),

  // Mentors ke liye hum skills pooch sakte hain (comma separated)
  skills: z.string().min(3, {
    message: "Please tell at least 1 skill which should be greater than 2 characters."
  }),

  bio: z.string().min(10, {
    message: "Please tell us about your experience in detail."
  }).max(1000).optional(),
});

export type MentorOnboardingValues = z.infer<typeof mentorOnboardingSchema>;