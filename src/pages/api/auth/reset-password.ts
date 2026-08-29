export const prerender = false;

import type { APIRoute } from "astro";
import { errorMessage, redirectTo } from "../../../lib/api-response";
import { createSupabaseServerClient } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirm-password")?.toString();

    if (!password || !confirmPassword) {
      return redirectTo(
        "/reset-password?error=" + encodeURIComponent("Both password fields are required"),
        request
      );
    }

    if (password !== confirmPassword) {
      return redirectTo(
        "/reset-password?error=" + encodeURIComponent("Passwords do not match"),
        request
      );
    }

    const supabase = createSupabaseServerClient(request, cookies);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirectTo(
        "/forgot-password?error=" +
          encodeURIComponent("Your reset link expired. Request a new one."),
        request
      );
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("updateUser password failed", error);
      return redirectTo(
        "/reset-password?error=" +
          encodeURIComponent(errorMessage(error, "Could not update password")),
        request
      );
    }

    await supabase.auth.signOut();

    return redirectTo(
      "/signin?success=" + encodeURIComponent("Password updated. Sign in with your new password."),
      request
    );
  } catch (error) {
    console.error("reset-password route crashed", error);
    return redirectTo(
      "/reset-password?error=" + encodeURIComponent(errorMessage(error, "Request failed")),
      request
    );
  }
};
