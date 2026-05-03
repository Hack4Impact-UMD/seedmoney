import type { EditableUser, NewUser, Users } from "@/src/types";
import { createBrowserClient } from "@/src/lib/supabase-client";
import type { UsersTableRow } from "@/src/types/frontend/usersTable";
import type { Campaign } from "@/src/types/db/campaigns";

type JoinedCampaign = {
  campaign_id: number;
  name: string;
  status: string;
  competition_id: number;
};

type UserWithCampaigns = Pick<
  Users,
  "id" | "first_name" | "last_name" | "email" | "created_at"
> & {
  campaign_members: {
    campaigns: JoinedCampaign;
  }[];
};

export async function readAllUsersWithCampaigns(): Promise<UsersTableRow[]> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.from("users").select(`
      id, first_name, last_name, email, created_at,
      campaign_members(
        campaigns(campaign_id, name, status, competition_id)
      )
    `);

  if (error) {
    console.error("Error reading users with campaigns:", error.message);
    return [];
  }

  const users = (data ?? []) as unknown as UserWithCampaigns[];

  return users.map((user) => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    created_at: user.created_at,
    campaigns: user.campaign_members.map((m) => ({
      campaign_id: m.campaigns.campaign_id,
      name: m.campaigns.name,
      status: m.campaigns.status as Campaign["status"],
      competition_id: m.campaigns.competition_id,
    })),
  }));
}

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
  updatedUser: Partial<EditableUser>,
): Promise<Users | null> {
  const supabase = await createBrowserClient();
  const sanitizedUpdatedUser: Partial<EditableUser> = {};

  if ("first_name" in updatedUser) {
    sanitizedUpdatedUser.first_name = updatedUser.first_name;
  }
  if ("middle_name" in updatedUser) {
    sanitizedUpdatedUser.middle_name = updatedUser.middle_name;
  }
  if ("last_name" in updatedUser) {
    sanitizedUpdatedUser.last_name = updatedUser.last_name;
  }
  if ("email" in updatedUser) {
    sanitizedUpdatedUser.email = updatedUser.email;
  }
  if ("phone_number" in updatedUser) {
    sanitizedUpdatedUser.phone_number = updatedUser.phone_number;
  }

  if (Object.keys(sanitizedUpdatedUser).length === 0) {
    console.warn("No editable user fields provided for update:", userId);
    return readUser(userId);
  }

  const { data, error } = await supabase
    .from("users")
    .update(sanitizedUpdatedUser)
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

export async function isExistingEmail(email: string): Promise<boolean> {
  const supabase = await createBrowserClient();

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Error checking email:", error.message);
    return false;
  }

  return data !== null;
}
