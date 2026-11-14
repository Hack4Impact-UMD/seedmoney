"use server";

import { requireAdmin } from "@/src/lib/requireAdmin";
import { createServiceRoleClient } from "@/src/lib/supabase-service";
import type { PendingAdminEmail } from "@/src/types/db/adminEmails";

export async function readPendingAdminEmail(): Promise<
  { success: true; email: PendingAdminEmail | null } | { success: false; error: string }
> {
  try {
    const session = await requireAdmin();
    const { data: { user }, error: authError } = await session.auth.getUser();
    if (authError || !user) throw new Error("Not authorized");
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from("admin_emails")
      .select("id, subject, status").eq("created_by", user.id).in("status", ["queued", "sending"])
      .order("queued_at").order("id").limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return { success: true, email: null };
    const total = await supabase.from("admin_email_recipients").select("id", { count: "exact", head: true }).eq("email_id", data.id);
    if (total.error || total.count === null) throw total.error ?? new Error("Recipient count unavailable");
    return { success: true, email: { ...data, recipientCount: total.count } as PendingAdminEmail };
  } catch (error) {
    console.error("Unable to read pending admin email:", error);
    return { success: false, error: "Unable to check queued emails. Please retry before sending." };
  }
}
