import { createBrowserClient } from "@/src/lib/supabase-client";

export const signInWithGoogle = async () => {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data?.url) {
    return { error: "No redirect URL returned from Supabase." };
  }

  window.location.assign(data.url);
  return { error: null };
};
