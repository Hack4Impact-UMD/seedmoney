"use server";

import { requireAdmin } from "@/src/lib/requireAdmin";
import { validHistoryInput, historyMonthBounds } from "@/src/lib/emailHistory";
import { fetchAllPagesAfter } from "@/src/lib/fetchAllPages";
import { EMAIL_HISTORY_STATUSES, type EmailHistoryInput, type EmailHistoryPage, type EmailHistoryResult } from "@/src/types/emailHistory";

const COLUMNS = "id, subject, status, completed_at, queued_at, recipient_groups, admin_email_recipients(count)";

export async function readEmailHistoryMonths(): Promise<EmailHistoryResult<string[]>> {
  try {
    const db = await requireAdmin();
    const rows = await fetchAllPagesAfter<{ id: string; completed_at: string | null }, string>((after, limit) => {
      let query = db.from("admin_emails").select("id, completed_at")
        .in("status", [...EMAIL_HISTORY_STATUSES]).not("queued_at", "is", null).order("id").limit(limit);
      if (after) query = query.gt("id", after);
      return query;
    }, row => row.id);
    return { success: true, data: [...new Set(rows.flatMap(row => row.completed_at ? [row.completed_at.slice(0, 7)] : []))].sort().reverse() };
  } catch (error) {
    console.error("Unable to load history months:", error);
    return { success: false, error: "Unable to load date filters. Please retry." };
  }
}

export async function readEmailHistory(input: EmailHistoryInput): Promise<EmailHistoryResult<EmailHistoryPage>> {
  try {
    const db = await requireAdmin();
    if (!validHistoryInput(input)) return { success: false, error: "Invalid history filters." };
    let query = db.from("admin_emails").select(COLUMNS, { count: "exact" })
      .in("status", [...EMAIL_HISTORY_STATUSES]).not("queued_at", "is", null);
    if (input.group !== "any") query = query.contains("recipient_groups", [input.group]);
    if (input.month !== "all") {
      const [start, end] = historyMonthBounds(input.month);
      query = query.gte("completed_at", start).lt("completed_at", end);
    }
    const { data, count, error } = await query.order("completed_at", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false }).range(input.page * input.pageSize, (input.page + 1) * input.pageSize - 1);
    if (error || count === null) throw error ?? new Error("History count unavailable");
    return { success: true, data: { emails: data ?? [], total: count } };
  } catch (error) {
    console.error("Unable to load email history:", error);
    return { success: false, error: "Unable to load sent history. Please retry." };
  }
}
