import type { AstroCookies } from "astro";

export const AUTH_INTENT_COOKIE = "auth_intent";

export function setAuthIntent(
  cookies: AstroCookies,
  intent: "recovery",
  request: Request
) {
  cookies.set(AUTH_INTENT_COOKIE, intent, {
    path: "/",
    maxAge: 60 * 60,
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
  });
}

export function clearAuthIntent(cookies: AstroCookies) {
  cookies.delete(AUTH_INTENT_COOKIE, { path: "/" });
}

export function readAuthIntent(cookies: AstroCookies): string | undefined {
  return cookies.get(AUTH_INTENT_COOKIE)?.value;
}
