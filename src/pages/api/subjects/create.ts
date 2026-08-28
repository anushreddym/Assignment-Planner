export const prerender = false;

import type { APIRoute } from "astro";
import { apiError, apiRedirectOrJson, apiUnauthorized } from "../../../lib/api-response";
import { createSupabaseServerClient } from "../../../lib/supabase";
import { isSubjectColor } from "../../../lib/tasks";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerClient(request, cookies);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return apiUnauthorized(request, redirect);

  const formData = await request.formData();
  const name = formData.get("name")?.toString().trim();
  const color = formData.get("color")?.toString() ?? "";

  if (!name) {
    return apiError(request, redirect, "/dashboard", "Subject name is required");
  }

  if (!isSubjectColor(color)) {
    return apiError(request, redirect, "/dashboard", "Invalid subject color");
  }

  const { data: subject, error } = await supabase
    .from("subjects")
    .insert({
      user_id: user.id,
      name,
      color,
    })
    .select("id, name, color")
    .single();

  if (error) {
    return apiError(request, redirect, "/dashboard", error.message);
  }

  return apiRedirectOrJson(request, redirect, "/dashboard", { subject });
};
