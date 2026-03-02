"use server";

import { signInWithGoogle } from "./login";

export async function signUpWithGoogle() {
  return signInWithGoogle();
}