"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// 1. LOGIN
export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };
  
  // Get user's role for proper redirect
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", data.user.id)
    .single();
  
  // Redirect based on role and onboarding status
  if (profile) {
    if (!profile.onboarding_completed) {
      return redirect(`/${profile.role}/onboarding`);
    }
    return redirect(`/${profile.role}`);
  }
  
  return redirect("/student");
}

// 2. SIGNUP
export async function signup(formData: FormData) {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) return { error: error.message };

  return { success: "Check your email to verify your account." };
}

// 3. LOGOUT
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/auth/login");
}

// 4. FORGOT PASSWORD
export async function forgotPassword(formData: FormData) {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/auth/update-password`,
  });

  if (error) return { error: error.message };

  return { success: "Password reset link sent to your email." };
}

// 5. UPDATE PASSWORD
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) return { error: error.message };

  return redirect("/");
}