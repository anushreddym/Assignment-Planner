export function wantsJson(request: Request): boolean {
  return request.headers.get("Accept")?.includes("application/json") ?? false;
}

/**
 * Response.redirect() produces immutable headers, which breaks when Astro
 * appends Supabase auth cookies. Build the response manually instead.
 */
export function redirectTo(path: string, request: Request, status = 303) {
  return new Response(null, {
    status,
    headers: { Location: new URL(path, request.url).toString() },
  });
}

export function jsonOk(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify({ ok: true, ...body }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function apiRedirectOrJson(
  request: Request,
  redirectUrl: string,
  jsonBody: Record<string, unknown>
) {
  if (wantsJson(request)) return jsonOk(jsonBody);
  return redirectTo(redirectUrl, request);
}

export function apiError(
  request: Request,
  redirectPath: string,
  message: string,
  status = 400
) {
  if (wantsJson(request)) return jsonError(message, status);
  return redirectTo(`${redirectPath}?error=${encodeURIComponent(message)}`, request);
}

export function apiUnauthorized(request: Request) {
  if (wantsJson(request)) return jsonError("Unauthorized", 401);
  return redirectTo("/signin", request);
}
