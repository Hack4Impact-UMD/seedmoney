import {Users} from "@/src/types";
import {supabase} from "@/src/lib/supabase-client";

export async function createUser(user: Users) {
    const { error } = await supabase.from("users").insert(user);

    if (error) {
        console.error("Error creating user:", error.message);
        return;
    }
    }

}

export async function readUser(id: number): Promise<Users | null> {
    const { data, error } = await supabase.from("users").select("*").eq("user_id", id).single();

    if (error) {
        console.error("Error reading user:", error);
        return null;
    }

    return data;
}

export async function updateUser(id: number, updatedUser: Partial<Users>) {
    const { error } = await supabase.from("users").update(updatedUser).eq("id", id);

    if (error) {
        console.error("Error updating user:", error);
        return;
    }
}

export async function deleteUser(id: number) {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
        console.error("Error deleting user:", error);
        return;
    }
}