import { createClient } from "@supabase/supabase-js";
import { getSecret, SUPABASE_URL } from "astro:env/server";

export function createSupabaseAdminClient() {
  const secretKey =
    getSecret("SUPABASE_SECRET_KEY") ?? getSecret("SUPABASE_SERVICE_ROLE_KEY");

  if (!secretKey) {
    return null;
  }

  return createClient(SUPABASE_URL, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
