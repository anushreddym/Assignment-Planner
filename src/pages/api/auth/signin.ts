export const prerender = false;

import type { APIRoute } from "astro";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return redirect("/signin?error=" + encodeURIComponent("Email and password are required"));
  }

  const supabase = createSupabaseServerClient(request, cookies);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/signin?error=" + encodeURIComponent(error.message));
  }

  return redirect("/dashboard");
};