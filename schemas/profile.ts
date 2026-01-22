import { z } from "zod";

// Helper for optional empty strings (Common pattern in forms)
const optionalString = z.string().optional().or(z.literal(""));

// Helper for Social Usernames
const username = z.string().min(3).max(50).optional().or(z.literal(""));

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),

  bio: z
    .string()
    .max(500, "Bio cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),

  department: z.string().min(2, "Department is required"),

  // Fix 1: Roll number bhi empty string aa sakta hai
  roll_number: optionalString,

  // Fix 2: Admission Year handling
  // Agar value exists kare to number mein convert kro, warna undefined rehne do
  admission_year: z
    .union([
        z.coerce.number().min(2015).max(new Date().getFullYear()), 
        z.string().length(0), // Allow empty string
        z.literal(0), // Allow 0 if explicitly set
        z.null(),
        z.undefined()
    ])
    .optional()
    .transform((e) => (e === "" || e === 0 ? undefined : e)), // Empty string ko undefined bana do

  // Fix 3: Skills ko String hi rakho Form ke liye.
  // Server action me .split(',') kar lena.
  skills: optionalString, 

  /* 🔥 CONTACT INFO OBJECT */
  contact_info: z.object({
    phone_no: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number")
      .optional()
      .or(z.literal("")),

    whatsapp_no: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, "Invalid WhatsApp number")
      .optional()
      .or(z.literal("")),

    telegram: username,
    twitter: username,
    github: username,
    linkedin: username,

    website: z
      .string()
      .url("Invalid URL (include https://)")
      .optional()
      .or(z.literal("")),
  }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;