import { Users } from "@/src/types";
import { supabase } from "@/src/lib/supabase-client";

export async function createUser(user: Users) {
  const { error } = await supabase.from("users").insert(user);

  if (error) {
    console.error("Error creating user:", error.message);
    return;
  }
}

export async function readUser(user_id: number): Promise<Users | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error("Error reading user:", error.message);
    return null;
  }

  return data;
}

export async function updateUser(user_id: number, updatedUser: Partial<Users>) {
  const { error } = await supabase
    .from("users")
    .update(updatedUser)
    .eq("user_id", user_id);

  if (error) {
    console.error("Error updating user:", error.message);
    return;
  }
}

export async function deleteUser(user_id: number) {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("user_id", user_id);

  if (error) {
    console.error("Error deleting user:", error.message);
    return;
  }
}
