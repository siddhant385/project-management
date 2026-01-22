import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Agar user login nahi hai aur protected route par hai
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // 2. Agar User Logged In hai
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profile) {
      const path = request.nextUrl.pathname;
      const role = profile.role; // 'student', 'mentor', or 'admin'

      // --- LOGIC START ---

      // SCENARIO A: Onboarding Incomplete hai
      if (!profile.onboarding_completed) {
        // Agar user apne sahi onboarding page par nahi hai, to wahan bhejo
        // Example: Agar student hai aur '/student/onboarding' par nahi hai
        if (!path.startsWith(`/${role}/onboarding`)) {
          const url = request.nextUrl.clone();
          url.pathname = `/${role}/onboarding`;
          return NextResponse.redirect(url);
        }
      } 
      
      // SCENARIO B: Onboarding Complete hai
      else {
        // Agar user Login page ya Root ('/') par hai -> Dashboard bhejo
        if (path === "/" || path.startsWith("/auth") || path === "/login") {
          const url = request.nextUrl.clone();
          url.pathname = `/${role}`; // Directly goes to /student, /admin etc.
          return NextResponse.redirect(url);
        }

        // OPTIONAL SECURITY: Cross-Role Protection
        // Agar 'student' galti se '/admin' wale route pe jaane ki koshish kare
        if (path.startsWith("/admin") && role !== "admin") {
           const url = request.nextUrl.clone();
           url.pathname = `/${role}`; // Wapas apne dashboard pe bhejo
           return NextResponse.redirect(url);
        }
        if (path.startsWith("/mentor") && role !== "mentor") {
           const url = request.nextUrl.clone();
           url.pathname = `/${role}`;
           return NextResponse.redirect(url);
        }
         if (path.startsWith("/student") && role !== "student") {
           const url = request.nextUrl.clone();
           url.pathname = `/${role}`;
           return NextResponse.redirect(url);
        }
      }
      // --- LOGIC END ---
    }
  }

  return supabaseResponse;
}