"use server";

import { createServerClient } from "../../lib/supabase-client";

export async function signInWithGoogle() {
    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    });

    if(error) {
        console.error("google sign in error:", error.message);
        return { error: error.message };
    }

    //url to redirect to url given by supabase
    return { url: data.url };
}