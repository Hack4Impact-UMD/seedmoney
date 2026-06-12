import { createBrowserClient } from "@/src/lib/supabase-client";

export type CampaignEmailType =
  | "campaign_submitted"
  | "campaign_approved"
  | "campaign_denied"
  | "draft_saved"
  | "campaign_live"
  | "donation_received";

export async function sendCampaignEmail(
  type: CampaignEmailType,
  campaignId: number,
) {
  const supabase = createBrowserClient();
  const { error } = await supabase.functions.invoke("send-campaign-email", {
    body: {
      type,
      campaign_id: campaignId,
    },
  });

  if (error) {
    console.error(`Error sending ${type} email:`, error.message);
    return false;
  }

  return true;
}
