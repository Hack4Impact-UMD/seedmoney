import type { NewUser, Users } from "@/src/types";
import { createServerClient } from "@/src/lib/supabase-client";

export async function createUser(user: NewUser) {
  const supabase = await createServerClient();

  const { error } = await supabase.from("users").insert(user);

  if (error) {
    console.error("Error creating user:", error.message);
    return;
  }
}

export async function readUser(userId: string): Promise<Users | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error reading user:", error.message);
    return null;
  }

  return data;
}

export async function updateUser(userId: string, updatedUser: Partial<Users>) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("users")
    .update(updatedUser)
    .eq("id", userId);

  if (error) {
    console.error("Error updating user:", error.message);
    return;
  }
}

export async function deleteUser(userId: string) {
  const supabase = await createServerClient();

  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    console.error("Error deleting user:", error.message);
    return;
  }
}
