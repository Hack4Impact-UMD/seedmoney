"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/src/lib/supabase-client";

const PENDING_SIGNUP_STORAGE_KEY = "seedmoney:pending-signup";

const clearPendingSignupState = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY);
};

const getErrorCode = (error: unknown) => {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: unknown }).code ?? "");
  }

  return "";
};

const isExpiredConfirmationError = (message: string, code = "") => {
  const normalizedError = `${message} ${code}`.toLowerCase();

  return (
    normalizedError.includes("otp_expired") ||
    normalizedError.includes("expired") ||
    normalizedError.includes("email link") ||
    (normalizedError.includes("invalid") &&
      (normalizedError.includes("token") ||
        normalizedError.includes("otp") ||
        normalizedError.includes("link")))
  );
};

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
      searchParams.get("error") ||
      hashParams.get("error");
    const providerErrorCode =
      searchParams.get("error_code") || hashParams.get("error_code") || "";

    if (providerError) {
      if (isExpiredConfirmationError(providerError, providerErrorCode)) {
        replaceRoute("/signup?confirmation=expired");
        return () => {
          isActive = false;
        };
      }

      replaceRoute(`/?error=${encodeURIComponent(providerError)}`);
      return () => {
        isActive = false;
      };
    }

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

          const sessionResult = await waitForSession(true);

          if (sessionResult.status === "session") {
            clearPendingSignupState();
            replaceRoute("/dashboard", true);
            return;
          }

          if (sessionResult.status === "error") {
            console.error("Auth callback session error:", sessionResult.message);
            replaceRoute("/?error=callback_failed");
            return;
          }

          const exchangeResult =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeResult.error) {
            console.error(
              "Auth callback code exchange error:",
              exchangeResult.error.message,
            );

            if (
              isExpiredConfirmationError(
                exchangeResult.error.message,
                getErrorCode(exchangeResult.error),
              )
            ) {
              replaceRoute("/signup?confirmation=expired");
              return;
            }

            replaceRoute("/?error=callback_failed");
            return;
          }

          if (exchangeResult.data.session?.user) {
            clearPendingSignupState();
            replaceRoute("/dashboard", true);
            return;
          }

          clearPendingSignupState();
          replaceRoute("/?confirmed=1");
          return;
        }

        if (hasImplicitTokens) {
          setStatusText("Completing email confirmation...");
        }

        const sessionResult = await waitForSession(hasImplicitTokens);

        if (sessionResult.status === "timeout") {
          console.error("Auth callback timed out waiting for session.");

          if (hasImplicitTokens) {
            clearPendingSignupState();
            replaceRoute("/?confirmed=1");
            return;
          }

          replaceRoute("/?error=callback_timeout");
          return;
        }

        if (sessionResult.status === "error") {
          console.error("Auth callback session error:", sessionResult.message);
          replaceRoute("/?error=callback_failed");
          return;
        }

        if (sessionResult.status === "session") {
          clearPendingSignupState();
          replaceRoute("/dashboard", true);
          return;
        }

        if (hasImplicitTokens) {
          clearPendingSignupState();
          replaceRoute("/?confirmed=1");
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
