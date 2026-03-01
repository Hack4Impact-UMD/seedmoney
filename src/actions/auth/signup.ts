import { supabase } from "@/src/lib/supabase-client";

export type AuthResult = {
  success: boolean;
  error?: string;
};

export async function signUp(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
