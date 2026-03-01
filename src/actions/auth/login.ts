import { supabase } from "@/src/lib/supabase-client";

export type AuthResult = {
  success: boolean;
  error?: string;
};

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }
  // TODO: redirect to /login after sign out
  return { success: true };
}
