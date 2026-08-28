export const prerender = false;

import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirm-password")?.toString();

  if (!name || !email || !password) {
    return redirect("/signup?error=" + encodeURIComponent("All fields are required"));
  }

  if (password !== confirmPassword) {
    return redirect("/signup?error=" + encodeURIComponent("Passwords do not match"));
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
    return redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  // Email confirmation enabled → no session yet
  if (!data.session) {
    return redirect("/check-email?email=" + encodeURIComponent(email));
  }

  return redirect("/dashboard");
};