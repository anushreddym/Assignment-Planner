import type { AstroCookies } from "astro";
import { createSupabaseServerClient } from "./supabase";

export async function getAuthUser(request: Request, cookies: AstroCookies) {
  const supabase = createSupabaseServerClient(request, cookies);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}
