"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/src/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let hasNavigated = false;

    const replaceRoute = (href: string, shouldRefresh = false) => {
      if (hasNavigated) {
        return;
      }

      hasNavigated = true;
      router.replace(href);

      if (shouldRefresh) {
        router.refresh();
      }
    };

    const providerError = searchParams.get("error_description");

    if (providerError) {
      replaceRoute(`/?error=${encodeURIComponent(providerError)}`);
      return;
    }

    const code = searchParams.get("code");

    if (!code) {
      replaceRoute("/?error=no_code");
      return;
    }

    const supabase = createBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        replaceRoute("/dashboard", true);
      }
    });

    const redirectIfSessionReady = async () => {
      const sessionTimeout = new Promise<"timeout">((resolve) => {
        setTimeout(() => resolve("timeout"), 5000);
      });

      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          sessionTimeout,
        ]);

        if (sessionResult === "timeout") {
          console.error("OAuth callback timed out waiting for session.");
          replaceRoute("/?error=callback_timeout");
          return;
        }

        if (sessionResult.error) {
          console.error("OAuth callback session error:", sessionResult.error.message);
          replaceRoute("/?error=callback_failed");
          return;
        }

        if (sessionResult.data.session?.user) {
          replaceRoute("/dashboard", true);
          return;
        }

        replaceRoute("/?error=callback_failed");
      } catch (error) {
        console.error("OAuth callback unexpected error:", error);
        replaceRoute("/?error=callback_failed");
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
