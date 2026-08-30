import { createBrowserClient } from "@supabase/ssr";

function getConfig() {
  const el = document.getElementById("confirm-auth");
  const url = el?.dataset.supabaseUrl;
  const key = el?.dataset.supabaseKey;
  if (!url || !key) return null;
  return { url, key };
}

export async function handleConfirmAuthHash() {
  const hash = window.location.hash;
  if (!hash || !hash.includes("access_token")) return;

  const params = new URLSearchParams(hash.slice(1));
  if (params.get("type") === "recovery") {
    window.location.replace("/reset-password" + hash);
    return;
  }

  const config = getConfig();
  if (!config) return;

  const supabase = createBrowserClient(config.url, config.key);
  const { error } = await supabase.auth.getSession();

  window.history.replaceState({}, "", window.location.pathname + window.location.search);

  if (error) {
    window.location.replace(`/confirm?error=${encodeURIComponent(error.message)}`);
    return;
  }

  window.location.replace("/confirm");
}
