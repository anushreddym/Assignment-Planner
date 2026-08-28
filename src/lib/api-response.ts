export function wantsJson(request: Request): boolean {
  return request.headers.get("Accept")?.includes("application/json") ?? false;
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
  redirect: (url: string) => Response,
  redirectUrl: string,
  jsonBody: Record<string, unknown>
) {
  if (wantsJson(request)) return jsonOk(jsonBody);
  return redirect(redirectUrl);
}

export function apiError(
  request: Request,
  redirect: (url: string) => Response,
  redirectPath: string,
  message: string,
  status = 400
) {
  if (wantsJson(request)) return jsonError(message, status);
  return redirect(`${redirectPath}?error=${encodeURIComponent(message)}`);
}

export function apiUnauthorized(request: Request, redirect: (url: string) => Response) {
  if (wantsJson(request)) return jsonError("Unauthorized", 401);
  return redirect("/signin");
}
