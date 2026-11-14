"use server";

import { requireAdmin } from "@/src/lib/requireAdmin";
import { createServiceRoleClient } from "@/src/lib/supabase-service";
import type { AdminEmailGroup, SentAdminEmail } from "@/src/types/db/adminEmails";

const HISTORY_LIMIT = 500;

// Every bulk email that reached at least some recipients, newest first
export async function readSentAdminEmails(): Promise<
  { success: true; emails: SentAdminEmail[] } | { success: false; error: string }
> {
  try {
    await requireAdmin();
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from("admin_emails")
      .select("id, subject, recipient_groups, status, queued_at, completed_at")
      .in("status", ["sent", "partially_failed"])
      .order("completed_at", { ascending: false }).order("id").limit(HISTORY_LIMIT);
    if (error) throw error;
    return {
      success: true,
      emails: (data ?? []).flatMap((row) => {
        const sentAt = row.completed_at ?? row.queued_at;
        if (!sentAt) return [];
        return [{
          id: row.id as string,
          subject: row.subject as string,
          recipientGroups: row.recipient_groups as AdminEmailGroup[],
          status: row.status as SentAdminEmail["status"],
          sentAt: sentAt as string,
        }];
      }),
    };
  } catch (error) {
    console.error("Unable to read sent admin emails:", error);
    return { success: false, error: "Unable to load sent emails. Please retry." };
  }
}
