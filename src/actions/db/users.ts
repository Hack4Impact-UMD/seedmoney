import type { NewUser, NewUserInternal, Users } from "@/src/types";
import { createBrowserClient } from "@/src/lib/supabase-client";


export async function createUser(user: NewUser): Promise<Users | null> {
  const supabase = await createBrowserClient();

  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Error creating user:", error.message);
    return null;
  }

  if (!data) {
    console.warn("User was not created.");
    return null;
  }

  return data as Users;
}

export async function readUser(userId: string): Promise<Users | null> {
  const supabase = await createBrowserClient();

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

export async function updateUser(
  userId: string,
  updatedUser: Partial<NewUserInternal>,
): Promise<Users | null> {
  const supabase = await createBrowserClient();

  const { data, error } = await supabase
    .from("users")
    .update(updatedUser)
    .eq("id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Error updating user:", error.message);
    return null;
  }

  if (!data) {
    console.warn("User not found for update:", userId);
    return null;
  }

  return data as Users;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const supabase = await createBrowserClient();

  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", userId)
    .select("id");

  if (error) {
    console.error("Error deleting user:", error.message);
    return false;
  }

  if (!data || data.length === 0) {
    console.warn("User not found for deletion:", userId);
    return false;
  }

  return true;
}
