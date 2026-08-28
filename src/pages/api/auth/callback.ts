export const prerender = false;

import type { APIRoute } from "astro";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = createSupabaseServerClient(request, cookies);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return redirect("/confirm?error=" + encodeURIComponent(error.message));
    }
    return redirect("/confirm");
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) {
      return redirect("/confirm?error=" + encodeURIComponent(error.message));
    }
    return redirect("/confirm");
  }

  return redirect("/confirm?error=" + encodeURIComponent("Missing confirmation code"));
};
