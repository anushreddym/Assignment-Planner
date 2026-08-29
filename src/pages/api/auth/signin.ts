export const prerender = false;

import type { APIRoute } from "astro";
import { redirectTo } from "../../../lib/api-response";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return redirectTo("/signin?error=" + encodeURIComponent("Email and password are required"), request);
  }

  const supabase = createSupabaseServerClient(request, cookies);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirectTo("/signin?error=" + encodeURIComponent(error.message), request);
  }

  return redirectTo("/dashboard", request);
};
