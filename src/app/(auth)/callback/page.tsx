"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/src/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const providerError = searchParams.get("error_description");

    if (providerError) {
      router.replace(`/?error=${encodeURIComponent(providerError)}`);
      return;
    }

    const code = searchParams.get("code");

    if (!code) {
      router.replace("/?error=no_code");
      return;
    }

    const supabase = createBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace("/dashboard");
        router.refresh();
      }
    });

    const redirectIfSessionReady = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        router.replace("/dashboard");
        router.refresh();
      }
    };

    void redirectIfSessionReady();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center text-[rgba(0,0,0,0.6)]">
      Completing Google sign in...
    </div>
  );
}
