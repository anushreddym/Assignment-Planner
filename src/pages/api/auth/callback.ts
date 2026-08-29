export const prerender = false;

import type { APIRoute } from "astro";
import { redirectTo } from "../../../lib/api-response";

/** Legacy email links may still point here — forward to /confirm. */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  return redirectTo(`/confirm${url.search}`, request);
};
