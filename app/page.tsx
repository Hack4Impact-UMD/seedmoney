"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, googleProvider } from "@/firebase/firebase.config";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"" | "signup" | "signin" | "google" | "signout">("");
  const [user, authLoading, authError] = useAuthState(auth);

  const getMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred.";
  };

  const requireCredentials = () => {
    if (!email || !password) {
      setErrorMessage("Enter both email and password.");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!requireCredentials()) return;
    setErrorMessage(null);
    setActionLoading("signup");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch (error) {
      setErrorMessage(getMessage(error));
    } finally {
      setActionLoading("");
    }
  };

  const handleSignIn = async () => {
    if (!requireCredentials()) return;
    setErrorMessage(null);
    setActionLoading("signin");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch (error) {
      setErrorMessage(getMessage(error));
    } finally {
      setActionLoading("");
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setActionLoading("google");
    googleProvider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setErrorMessage(getMessage(error));
    } finally {
      setActionLoading("");
    }
  };

  const handleSignOut = async () => {
    setErrorMessage(null);
    setActionLoading("signout");
    try {
      await signOut(auth);
    } catch (error) {
      setErrorMessage(getMessage(error));
    } finally {
      setActionLoading("");
    }
  };

  const isBusy = authLoading || actionLoading !== "";

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <section className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Firebase Auth</h1>
        <p className="mt-2 text-sm text-slate-600">Email/password + Google sign-in</p>

        {authError && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{authError.message}</p>}
        {errorMessage && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}

        {user ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Signed in as</p>
              <p className="font-medium">{user.email ?? "No email on profile"}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isBusy}
              className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {actionLoading === "signout" ? "Signing out..." : "Sign out"}
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="At least 6 characters"
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isBusy}
                className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {actionLoading === "signin" ? "Signing in..." : "Sign in"}
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={isBusy}
                className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 disabled:opacity-60"
              >
                {actionLoading === "signup" ? "Creating..." : "Create account"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isBusy}
              className="w-full rounded-md bg-white px-4 py-2.5 text-sm font-medium text-slate-900 ring-1 ring-slate-300 disabled:opacity-60"
            >
              {actionLoading === "google" ? "Opening Google..." : "Continue with Google"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
