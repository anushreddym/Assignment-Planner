import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerClient } from "./lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.request, context.cookies);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.user = user;

  if (context.url.pathname.startsWith("/dashboard") && !user) {
    return context.redirect("/signin");
  }

  const isAuthPage =
    context.url.pathname.startsWith("/signin") ||
    context.url.pathname.startsWith("/signup") ||
    context.url.pathname.startsWith("/check-email");

  if (user && (context.url.pathname === "/" || isAuthPage)) {
    return context.redirect("/dashboard");
  }

  return next();
});