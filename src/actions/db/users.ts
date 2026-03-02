import type { NewUser, Users } from "@/src/types";
import { supabase } from "@/src/lib/supabase-client";

export async function createUser(user: NewUser) {
  const { error } = await supabase.from("users").insert(user);

  if (error) {
    console.error("Error creating user:", error.message);
    return;
  }
}

export async function readUser(userId: string): Promise<Users | null> {
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
  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    console.error("Error deleting user:", error.message);
    return;
  }
}
