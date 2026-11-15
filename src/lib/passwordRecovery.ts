import type { SupabaseClient } from "@supabase/supabase-js";

export async function verifyPasswordRecovery(supabase: SupabaseClient, url: URL) {
  const tokenHash = url.searchParams.get("token_hash");
  if (tokenHash) {
    if (url.searchParams.get("type") !== "recovery") return false;
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    return !error && !!data.session;
  }

  const hash = new URLSearchParams(url.hash.slice(1));
  if (!url.searchParams.has("code") &&
      !(hash.get("type") === "recovery" && hash.has("access_token"))) {
    return false;
  }

  // The SSR browser client exchanges standard recovery links automatically.
  // Require its recovery event, not an unrelated session already in this browser.
  return new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => finish(false), 15000);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") finish(!!session);
    });
    function finish(verified: boolean) {
      clearTimeout(timeout);
      subscription.unsubscribe();
      resolve(verified);
    }
    supabase.auth.initialize().then(
      ({ error }) => { if (error) finish(false); },
      () => finish(false),
    );
  });
}
