export const prerender = false;

import type { APIRoute } from "astro";
import { redirectTo } from "../../../lib/api-response";
import { authHandlerRedirect } from "../../../lib/auth-routes";

/** Legacy email links may still point here — forward to the right auth handler. */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  return redirectTo(authHandlerRedirect(url), request);
};
