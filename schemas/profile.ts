import { z } from "zod/v4";

// Helper for optional empty strings (Common pattern in forms)
const optionalString = z.string().optional().or(z.literal(""));

// Helper for Social Usernames
const username = z.string().min(3).max(50).optional().or(z.literal(""));

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters" })
    .max(50, { error: "Name too long" }),

  bio: z
    .string()
    .max(500, { error: "Bio cannot exceed 500 characters" })
    .optional()
    .or(z.literal("")),

  department: z.string().min(2, { error: "Department is required" }),

  // Fix 1: Roll number bhi empty string aa sakta hai
  roll_number: optionalString,

  // Fix 2: Admission Year handling - simplified for proper type inference
  admission_year: z.coerce
    .number()
    .min(2015, { error: "Year after 2015 is needed" })
    .max(new Date().getFullYear(), { error: "Future Admission Year detected" })
    .optional(),

  // Fix 3: Skills ko String hi rakho Form ke liye.
  // Server action me .split(',') kar lena.
  skills: optionalString, 

  /* 🔥 CONTACT INFO OBJECT */
  contact_info: z.object({
    phone_no: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, { error: "Invalid phone number" })
      .optional()
      .or(z.literal("")),

    whatsapp_no: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, { error: "Invalid WhatsApp number" })
      .optional()
      .or(z.literal("")),

    telegram: username,
    twitter: username,
    github: username,
    linkedin: username,

    website: z
      .string()
      .url({ error: "Invalid URL (include https://)" })
      .optional()
      .or(z.literal("")),
  }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;