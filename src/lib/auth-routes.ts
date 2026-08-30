/** Route Supabase auth callbacks to the correct page. */
export function authHandlerPath(
  searchParams: URLSearchParams,
  intent?: string | null
): "/confirm" | "/reset-password" {
  if (searchParams.get("type") === "recovery") return "/reset-password";
  if (intent === "recovery") return "/reset-password";
  return "/confirm";
}

export function authHandlerRedirect(url: URL, intent?: string | null): string {
  return `${authHandlerPath(url.searchParams, intent)}${url.search}`;
}
