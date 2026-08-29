import { createClient } from "@supabase/supabase-js";
import { getSecret } from "astro:env/server";

export function createSupabaseAdminClient() {
  const url = getSecret("SUPABASE_URL");
  const secretKey =
    getSecret("SUPABASE_SECRET_KEY") ?? getSecret("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !secretKey) {
    return null;
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
