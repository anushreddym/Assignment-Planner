import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { getSecret } from "astro:env/server";
import type { AstroCookies } from "astro";

function requireEnv(name: string): string {
  const value = getSecret(name);
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createSupabaseServerClient(request: Request, cookies: AstroCookies) {
  const url = requireEnv("SUPABASE_URL");
  const key = requireEnv("SUPABASE_PUBLISHABLE_KEY");

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "").map(
          ({ name, value }) => ({ name, value: value ?? "" })
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookies.set(name, value, options)
        );
      },
    },
  });
}
