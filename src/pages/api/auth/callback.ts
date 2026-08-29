export const prerender = false;

import type { APIRoute } from "astro";
import type { EmailOtpType } from "@supabase/supabase-js";
import { redirectTo } from "../../../lib/api-response";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = createSupabaseServerClient(request, cookies);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return redirectTo("/confirm?error=" + encodeURIComponent(error.message), request);
    }
    return redirectTo("/confirm", request);
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) {
      return redirectTo("/confirm?error=" + encodeURIComponent(error.message), request);
    }
    return redirectTo("/confirm", request);
  }

  return redirectTo("/confirm?error=" + encodeURIComponent("Missing confirmation code"), request);
};
