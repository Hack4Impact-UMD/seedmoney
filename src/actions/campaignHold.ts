"use server";

import { requireAdmin } from "@/src/lib/requireAdmin";
import type { CampaignNote } from "@/src/types/db/campaignNotes";

const MAX_NOTE_LENGTH = 2000;

const SINGLE_HOLD_ERROR =
  "Only one campaign can be placed on hold at a time.";

function parseCampaignId(campaignId: unknown): number {
  if (Array.isArray(campaignId)) {
    throw new Error(SINGLE_HOLD_ERROR);
  }
  if (
    typeof campaignId !== "number" ||
    !Number.isInteger(campaignId) ||
    campaignId <= 0
  ) {
    throw new Error("Invalid campaign ID");
  }
  return campaignId;
}

function parseNote(note: unknown): string {
  if (typeof note !== "string") {
    throw new Error("Note must be text");
  }
  const trimmed = note.trim();
  if (trimmed.length > MAX_NOTE_LENGTH) {
    throw new Error(`Notes must be ${MAX_NOTE_LENGTH} characters or fewer`);
  }
  return trimmed;
}

// Accepts exactly one campaign ID. Arrays are rejected here and, because the
// RPC takes a scalar bigint, again in the database.
export async function holdCampaign(campaignId: unknown, note?: unknown) {
  const id = parseCampaignId(campaignId);
  const parsedNote = note == null ? null : parseNote(note);

  const supabase = await requireAdmin();
  const { error } = await supabase.rpc("hold_campaign", {
    p_campaign_id: id,
    p_note: parsedNote || null,
  });

  if (error) {
    throw new Error(`Failed to place campaign on hold: ${error.message}`);
  }

  return { success: true };
}

// Reads go through the caller's session, so RLS on campaign_notes decides
// visibility: non-admins get no rows.
export async function readCampaignNote(
  campaignId: unknown,
): Promise<CampaignNote | null> {
  const id = parseCampaignId(campaignId);
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("campaign_notes")
    .select("campaign_id, note, updated_by, created_at, updated_at")
    .eq("campaign_id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load admin note: ${error.message}`);
  }
  return data;
}

// Saves the note; an empty note deletes it.
export async function saveCampaignNote(campaignId: unknown, note: unknown) {
  const id = parseCampaignId(campaignId);
  const parsedNote = parseNote(note);
  const supabase = await requireAdmin();

  if (!parsedNote) {
    const { error } = await supabase
      .from("campaign_notes")
      .delete()
      .eq("campaign_id", id);
    if (error) {
      throw new Error(`Failed to clear admin note: ${error.message}`);
    }
    return { success: true };
  }

  const { error } = await supabase
    .from("campaign_notes")
    .upsert({ campaign_id: id, note: parsedNote }, { onConflict: "campaign_id" });

  if (error) {
    throw new Error(`Failed to save admin note: ${error.message}`);
  }
  return { success: true };
}
