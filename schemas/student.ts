import { z } from "zod/v4";

export const studentOnboardingSchema = z.object({
  full_name: z.string().min(2, { 
    message: "Name must be greater than 2 characters." 
  }),
  
  department: z.enum(["CSE", "ECE", "ME", "CE", "IT", "AIDS", "EE", "IP", "MATH", "CHEM", "PHY", "T&P","MECH"], {
    message: "Its compulsory for you to choose the department.",
  }),

  admission_year: z.coerce.number()
    .min(2015, "Year should be chosen after 2015")
    .max(new Date().getFullYear(), "Future years aren't allowed"),

  roll_number: z.string().min(1, { 
    message: "roll_number is compulsory" 
  }),

  bio: z.string().max(500, {
    message: "Bio characters must be less than 500 words."
  }).optional(),
});

export type StudentOnboardingValues = z.infer<typeof studentOnboardingSchema>;