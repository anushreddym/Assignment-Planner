export const prerender = false;

import type { APIRoute } from "astro";
import { redirectTo } from "../../../lib/api-response";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirm-password")?.toString();

    if (!name || !email || !password) {
      return redirectTo("/signup?error=" + encodeURIComponent("All fields are required"), request);
    }

    if (password !== confirmPassword) {
      return redirectTo("/signup?error=" + encodeURIComponent("Passwords do not match"), request);
    }

    const supabase = createSupabaseServerClient(request, cookies);
    const origin = new URL(request.url).origin;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${origin}/api/auth/callback`,
      },
    });

    if (error) {
      return redirectTo("/signup?error=" + encodeURIComponent(error.message), request);
    }

    if (!data.session) {
      return redirectTo("/check-email?email=" + encodeURIComponent(email), request);
    }

    return redirectTo("/dashboard", request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return redirectTo("/signup?error=" + encodeURIComponent(message), request);
  }
};
