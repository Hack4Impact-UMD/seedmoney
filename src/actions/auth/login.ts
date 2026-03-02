"use server";

import { createServerClient } from "../../lib/supabase-client";

export async function signInWithGoogle(): 
Promise<{ url: string } | { error: string }> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      throw new Error("NEXT_PUBLIC_SITE_URL is not defined");
    }

    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google sign-in error:", error.message);
      return { error: error.message };
    }

    if (!data?.url) {
      return { error: "No redirect URL returned from Supabase" };
    }

    return { url: data.url };
  } catch (err) {
    console.error("Unexpected sign-in error:", err);
    return { error: "Unexpected server error" };
  }
}