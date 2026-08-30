/** Route Supabase auth callbacks to the correct page. */
export function authHandlerPath(searchParams: URLSearchParams): "/confirm" | "/reset-password" {
  if (searchParams.get("type") === "recovery") return "/reset-password";
  return "/confirm";
}

export function authHandlerRedirect(url: URL): string {
  return `${authHandlerPath(url.searchParams)}${url.search}`;
}

export function authHandlerHashRedirect(hash: string): string {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const path = authHandlerPath(params);
  return `${path}${hash}`;
}
