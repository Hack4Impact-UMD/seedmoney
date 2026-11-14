"use server";

import { requireAdmin } from "@/src/lib/requireAdmin";
import { createServiceRoleClient } from "@/src/lib/supabase-service";
import { emailDraftValuesError } from "@/src/lib/emailDraftValidation";
import type { AdminEmailDraft, EmailDraftResult, SaveEmailDraftInput } from "@/src/types/db/adminEmails";

const DRAFT_COLUMNS = "id, created_by, competition_id, subject, body_html, recipient_groups, status, version, updated_at";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CONFLICT = "This draft changed in another session or is no longer editable. Reload the saved draft before continuing.";

async function draftContext() {
  const session = await requireAdmin();
  const { data: { user }, error } = await session.auth.getUser();
  if (error || !user) throw new Error("Not authorized");
  return { supabase: createServiceRoleClient(), userId: user.id };
}

function failure(error: string, conflict = false): EmailDraftResult {
  return { success: false, error, code: conflict ? "conflict" : "error" };
}

function validVersion(id: unknown, version: unknown) {
  return typeof id === "string" && UUID.test(id) &&
    typeof version === "number" && Number.isSafeInteger(version) && version >= 0;
}

function matchesSavedRequest(draft: AdminEmailDraft, input: SaveEmailDraftInput) {
  return draft.status === "draft" && draft.version === input.version + 1 &&
    draft.subject === input.subject && draft.body_html === input.bodyHtml &&
    JSON.stringify(draft.recipient_groups) === JSON.stringify(input.recipientGroups);
}

export async function readLatestEmailDraft(): Promise<EmailDraftResult> {
  try {
    const { supabase, userId } = await draftContext();
    const { data, error } = await supabase.from("admin_emails")
      .select(DRAFT_COLUMNS).eq("created_by", userId).eq("status", "draft")
      .order("updated_at", { ascending: false }).order("id").limit(1).maybeSingle();
    if (error) throw error;
    return { success: true, draft: data as AdminEmailDraft | null };
  } catch (error) {
    console.error("Unable to load admin email draft:", error);
    return failure("Unable to load your saved draft. Please retry before editing.");
  }
}

export async function saveEmailDraft(input: SaveEmailDraftInput): Promise<EmailDraftResult> {
  try {
    const { supabase, userId } = await draftContext();
    const invalidFields = emailDraftValuesError(input);
    if (!input || !validVersion(input.id, input.version) || invalidFields) {
      return { success: false, code: "validation", error: invalidFields ?? "Invalid draft identity or version." };
    }

    const fields = { subject: input.subject, body_html: input.bodyHtml, recipient_groups: input.recipientGroups };
    let draft: AdminEmailDraft | null;
    if (input.version === 0) {
      const { data: competition, error: competitionError } = await supabase
        .from("competition_metadata").select("competition_id").eq("is_current", true).maybeSingle();
      if (competitionError) throw competitionError;
      const { data, error } = await supabase.from("admin_emails")
        .insert({ ...fields, id: input.id, created_by: userId, competition_id: competition?.competition_id ?? null, status: "draft" })
        .select(DRAFT_COLUMNS).single();
      if (error && error.code !== "23505") throw error;
      draft = data as AdminEmailDraft | null;
    } else {
      const { data, error } = await supabase.from("admin_emails").update(fields)
        .eq("id", input.id).eq("created_by", userId).eq("status", "draft").eq("version", input.version)
        .select(DRAFT_COLUMNS).maybeSingle();
      if (error) throw error;
      draft = data as AdminEmailDraft | null;
    }
    if (draft) return { success: true, draft };

    // A response can be lost after a write commits. Acknowledge only that exact write.
    const { data: existing, error } = await supabase.from("admin_emails")
      .select(DRAFT_COLUMNS).eq("id", input.id).eq("created_by", userId).maybeSingle();
    if (error) throw error;
    if (existing && matchesSavedRequest(existing as AdminEmailDraft, input)) {
      return { success: true, draft: existing as AdminEmailDraft };
    }
    return failure(CONFLICT, true);
  } catch (error) {
    console.error("Unable to save admin email draft:", error);
    return failure("Unable to save your draft. Your edits are still in this tab. Please retry.");
  }
}

export async function discardEmailDraft(id: string, version: number): Promise<EmailDraftResult> {
  try {
    const { supabase, userId } = await draftContext();
    if (!validVersion(id, version) || version === 0) return failure("Invalid draft.");
    const { data, error } = await supabase.from("admin_emails").delete()
      .eq("id", id).eq("created_by", userId).eq("status", "draft").eq("version", version)
      .select("id").maybeSingle();
    if (error) throw error;
    if (!data) {
      const { data: existing, error: readError } = await supabase.from("admin_emails")
        .select("id").eq("id", id).eq("created_by", userId).maybeSingle();
      if (readError) throw readError;
      if (existing) return failure(CONFLICT, true);
    }
    return { success: true, draft: null };
  } catch (error) {
    console.error("Unable to discard admin email draft:", error);
    return failure("Unable to discard your draft. Nothing has been cleared from this tab.");
  }
}
