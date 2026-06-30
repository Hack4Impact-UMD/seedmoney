"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/src/lib/supabase-client";

type SessionWaitResult =
  | { status: "session" }
  | { status: "missing" }
  | { status: "timeout" }
  | { status: "error"; message: string };

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusText, setStatusText] = useState("Completing sign in...");

  useEffect(() => {
    let hasNavigated = false;
    let isActive = true;

    const replaceRoute = (href: string, shouldRefresh = false) => {
      if (hasNavigated || !isActive) {
        return;
      }

      hasNavigated = true;
      router.replace(href);

      if (shouldRefresh) {
        router.refresh();
      }
    };

    const supabase = createBrowserClient();
    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, ""),
    );
    const providerError =
      searchParams.get("error_description") ||
      hashParams.get("error_description") ||
      searchParams.get("error");

    if (providerError) {
      replaceRoute(`/?error=${encodeURIComponent(providerError)}`);
      return () => {
        isActive = false;
      };
    }

    const withTimeout = <T,>(promise: Promise<T>) =>
      new Promise<T | "timeout">((resolve, reject) => {
        const timeoutId = setTimeout(() => resolve("timeout"), 5000);

        promise
          .then((value) => {
            clearTimeout(timeoutId);
            resolve(value);
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
          });
      });

    const waitForSession = (waitForAuthEvent = false) =>
      new Promise<SessionWaitResult>((resolve) => {
        let settled = false;
        let subscription: { unsubscribe: () => void } | null = null;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const finish = (result: SessionWaitResult) => {
          if (settled) {
            return;
          }

          settled = true;
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          subscription?.unsubscribe();
          resolve(result);
        };

        timeoutId = setTimeout(() => {
          finish({ status: "timeout" });
        }, 5000);

        const authListener = supabase.auth.onAuthStateChange(
          (_event, session) => {
            if (session?.user) {
              finish({ status: "session" });
            }
          },
        );

        subscription = authListener.data.subscription;

        void supabase.auth
          .getSession()
          .then(({ data, error }) => {
            if (error) {
              finish({ status: "error", message: error.message });
              return;
            }

            if (data.session?.user) {
              finish({ status: "session" });
              return;
            }

            if (waitForAuthEvent) {
              return;
            }

            finish({ status: "missing" });
          })
          .catch((error) => {
            finish({
              status: "error",
              message:
                error instanceof Error ? error.message : "callback_failed",
            });
          });
      });

    const redirectIfSessionReady = async () => {
      try {
        const code = searchParams.get("code");
        const hasImplicitTokens =
          hashParams.has("access_token") || hashParams.has("refresh_token");

        if (code) {
          setStatusText("Completing authentication...");

          const exchangeResult = await withTimeout(
            supabase.auth.exchangeCodeForSession(code),
          );

          if (exchangeResult === "timeout") {
            console.error("Auth callback timed out exchanging code.");
            replaceRoute("/?error=callback_timeout");
            return;
          }

          if (exchangeResult.error) {
            console.error(
              "Auth callback code exchange error:",
              exchangeResult.error.message,
            );
            replaceRoute("/?error=callback_failed");
            return;
          }

          if (exchangeResult.data.session?.user) {
            replaceRoute("/dashboard", true);
            return;
          }
        }

        if (hasImplicitTokens) {
          setStatusText("Completing email confirmation...");
        }

        const sessionResult = await waitForSession(hasImplicitTokens);

        if (sessionResult.status === "timeout") {
          console.error("Auth callback timed out waiting for session.");
          replaceRoute("/?error=callback_timeout");
          return;
        }

        if (sessionResult.status === "error") {
          console.error("Auth callback session error:", sessionResult.message);
          replaceRoute("/?error=callback_failed");
          return;
        }

        if (sessionResult.status === "session") {
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
      isActive = false;
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center text-[rgba(0,0,0,0.6)]">
      {statusText}
    </div>
  );
}
