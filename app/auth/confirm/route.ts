import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const code = searchParams.get("code");

  // Origin nikalo (http://localhost:3000)
  const origin = request.nextUrl.origin;
  const redirectTo = new URL(next, origin);

  // 1. Agar 'code' hai (PKCE Flow)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Success!
      return NextResponse.redirect(redirectTo);
    } 
    
    // Agar Error aaya, to use chupao mat, dikhao!
    console.error("Auth Exchange Error:", error.message); 
    const errorUrl = new URL("/auth/auth-code-error", origin);
    errorUrl.searchParams.set("error", error.message); // Asli error dikhao
    return NextResponse.redirect(errorUrl);
  }

  // 2. Agar 'token_hash' hai (Magic Link Flow)
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
    // Agar yahan error aaya
    const errorUrl = new URL("/auth/auth-code-error", origin);
    errorUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(errorUrl);
  }

  // 3. Agar na code hai, na token_hash
  const errorUrl = new URL("/auth/auth-code-error", origin);
  errorUrl.searchParams.set("error", "No code or token detected");
  return NextResponse.redirect(errorUrl);
}