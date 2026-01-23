import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client with service role key
 * Required ONLY for auth.admin operations like deleting users from auth.users table
 * 
 * ⚠️ SECURITY: This client bypasses RLS. 
 * ALWAYS verify isAdmin() BEFORE using this client.
 * 
 * IMPORTANT: Never expose this client to the frontend
 * This file intentionally does NOT have "use server" directive
 * because it's a utility function, not a server action.
 * It's only imported in server action files.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env.local file.");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
