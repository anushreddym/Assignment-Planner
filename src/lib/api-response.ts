export function wantsJson(request: Request): boolean {
  return request.headers.get("Accept")?.includes("application/json") ?? false;
}

/** Use instead of Astro redirect() after reading request.formData() on Vercel. */
export function redirectTo(path: string, request: Request, status = 303) {
  return Response.redirect(new URL(path, request.url).toString(), status);
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
