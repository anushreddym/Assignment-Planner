export const prerender = false;

import type { APIRoute } from "astro";
import { apiError, apiRedirectOrJson, apiUnauthorized } from "../../../lib/api-response";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerClient(request, cookies);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return apiUnauthorized(request, redirect);

  const formData = await request.formData();
  const id = formData.get("id")?.toString();

  if (!id) {
    return apiError(request, redirect, "/dashboard", "Missing task id");
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return apiError(request, redirect, "/dashboard", error.message);
  }

  return apiRedirectOrJson(request, redirect, "/dashboard", { id });
};
