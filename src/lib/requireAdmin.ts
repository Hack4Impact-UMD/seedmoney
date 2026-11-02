import "server-only";

import { createServerClient } from "@/src/lib/supabase-client";

export async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: isAdmin, error } = await supabase.rpc("is_in_app_admin");

  if (error || isAdmin !== true) {
    throw new Error("Not authorized");
  }

  return supabase;
}
