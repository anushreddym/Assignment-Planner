export const prerender = false;

import type { APIRoute } from "astro";
import { apiError, apiRedirectOrJson, apiUnauthorized } from "../../../lib/api-response";
import { createSupabaseAdminClient } from "../../../lib/supabase-admin";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return apiUnauthorized(request);

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return apiError(
      request,
      "/dashboard",
      "Account deletion is not configured on the server"
    );
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return apiError(request, "/dashboard", error.message);
  }

  await supabase.auth.signOut();

  return apiRedirectOrJson(request, "/", {});
};
