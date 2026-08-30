export const prerender = false;

import type { APIRoute } from "astro";
import { errorMessage, redirectTo } from "../../../lib/api-response";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email")?.toString()?.trim();

    if (!email) {
      return redirectTo(
        "/forgot-password?error=" + encodeURIComponent("Email is required"),
        request
      );
    }

    const supabase = createSupabaseServerClient(request, cookies);
    const origin = new URL(request.url).origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password?type=recovery`,
    });

    if (error) {
      console.error("resetPasswordForEmail failed", error);
      return redirectTo(
        "/forgot-password?error=" +
          encodeURIComponent(errorMessage(error, "Could not send reset email")),
        request
      );
    }

    return redirectTo(
      "/forgot-password?sent=1&email=" + encodeURIComponent(email),
      request
    );
  } catch (error) {
    console.error("forgot-password route crashed", error);
    return redirectTo(
      "/forgot-password?error=" + encodeURIComponent(errorMessage(error, "Request failed")),
      request
    );
  }
};
