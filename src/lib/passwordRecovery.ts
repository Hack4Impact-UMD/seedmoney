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

  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.initialize();
    if (error) return false;
    // The browser client removes the code from the URL after a successful exchange.
    // Do not exchange that single-use code a second time.
    if (new URL(window.location.href).searchParams.has("code")) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      return !error && !!data.session;
    }
    const { data, error: sessionError } = await supabase.auth.getSession();
    return !sessionError && !!data.session;
  }

  const hash = new URLSearchParams(url.hash.slice(1));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (hash.get("type") === "recovery" && accessToken && refreshToken) {
    // Dashboard-generated links can use implicit tokens rather than PKCE codes.
    // Explicitly establish that session even though the shared client uses PKCE.
    await supabase.auth.initialize();
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return !error && !!data.session;
  }
  return false;
}
