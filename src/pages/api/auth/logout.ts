export const prerender = false;

import type { APIRoute } from "astro";
import { redirectTo } from "../../../lib/api-response";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient(request, cookies);
  await supabase.auth.signOut();

  return redirectTo("/", request);
};
