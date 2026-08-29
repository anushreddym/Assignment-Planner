import { createBrowserClient } from "@supabase/ssr";

function getConfig() {
  const el = document.getElementById("reset-auth");
  const url = el?.dataset.supabaseUrl;
  const key = el?.dataset.supabaseKey;
  if (!url || !key) return null;
  return { url, key };
}

export async function handleResetAuthHash() {
  const hash = window.location.hash;
  if (!hash || !hash.includes("access_token")) return;

  const config = getConfig();
  if (!config) return;

  const supabase = createBrowserClient(config.url, config.key);
  const { error } = await supabase.auth.getSession();

  window.history.replaceState({}, "", window.location.pathname + window.location.search);

  if (error) {
    window.location.replace(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }
}
