import { createServerClient } from "@/src/lib/supabase-client";
import {
  CampaignImageRecord,
  CampaignFile,
} from "@/src/types/db/campaignImageRecords";

export async function uploadCampaignImage({
  file,
  campaignId,
  displayOrder,
  isMain = false,
}: CampaignFile): Promise<CampaignImageRecord> {
  const supabase = await createServerClient();

  const fileName = file.name.replace(/\s+/g, "-");
  const filePath = `campaigns/${campaignId}/${crypto.randomUUID()}-${fileName}`;

  const { error } = await supabase.storage
    .from("campaign_images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data, error: insertError } = await supabase
    .from("campaign_image_records")
    .insert({
      campaign_id: campaignId,
      storage_path: filePath,
      display_order: displayOrder,
      is_main: isMain,
    })
    .select("image_id, campaign_id, storage_path, display_order, is_main")
    .single();

  if (insertError) {
    await supabase.storage.from("campaign_images").remove([filePath]);
    throw new Error(`DB insert failed: ${insertError.message}`);
  }

  return data;
}
