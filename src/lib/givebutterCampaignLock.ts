import "server-only";
import { createServiceRoleClient } from "./supabase-service";

export async function withCampaignPublicationLock<T>(
  campaignId: number,
  action: "suspend" | "republish",
  operation: (recordUncertainOutcome: (message: string) => Promise<void>) => Promise<T>,
): Promise<T> {
  const supabase = createServiceRoleClient();
  const { data: lock, error } = await supabase
    .from("campaign_publication_operations")
    .insert({ campaign_id: campaignId, action })
    .select("operation_id")
    .single();

  if (error?.code === "23505") {
    throw new Error("A publication change is already running or needs reconciliation for this campaign.");
  }
  if (error || !lock) throw new Error("Unable to reserve the campaign publication change.");

  let uncertain = false;
  const recordUncertainOutcome = async (message: string) => {
    uncertain = true;
    console.error(`Campaign ${campaignId}, operation ${lock.operation_id}: ${message}`);
    const { error: recordError } = await supabase
      .from("campaign_publication_operations")
      .update({ error: message })
      .eq("campaign_id", campaignId)
      .eq("operation_id", lock.operation_id);
    if (recordError) console.error("Failed to record publication error:", recordError.message);
  };

  try {
    return await operation(recordUncertainOutcome);
  } finally {
    if (!uncertain) {
      const { data: released, error: releaseError } = await supabase
        .from("campaign_publication_operations")
        .delete()
        .eq("campaign_id", campaignId)
        .eq("operation_id", lock.operation_id)
        .select("operation_id");
      if (releaseError || !released?.length) {
        throw new Error("Unable to release the publication operation. Verify the campaign before retrying.");
      }
    }
  }
}
