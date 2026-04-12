import { createBrowserClient, createServerClient } from "@/src/lib/supabase-client";
import {
  CampaignImageRecord,
  CampaignFile,
  HydratedCampaignImageRecord,
} from "@/src/types/db/campaignImageRecords";

function getDisplayFileName(storagePath: string, storedName?: string) {
  const fallbackName = storagePath.split("/").pop() ?? "Uploaded image";
  const rawName = storedName || fallbackName;

  return rawName.replace(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i,
    "",
  );
}

export async function uploadCampaignImage({
  file,
  campaignId,
  displayOrder,
  isMain = false,
}: CampaignFile): Promise<CampaignImageRecord> {
  const supabase = createBrowserClient();

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
    .select("id, campaign_id, storage_path, display_order, is_main")
    .single();

  if (insertError) {
    await supabase.storage.from("campaign_images").remove([filePath]);
    throw new Error(`DB insert failed: ${insertError.message}`);
  }

  return data;
}

export async function deleteCampaignImage(
  storagePath: string,
): Promise<boolean> {
  const supabase = createBrowserClient();

  const { error: storageError } = await supabase.storage
    .from("campaign_images")
    .remove([storagePath]);

  if (storageError) {
    throw new Error(`Storage delete failed: ${storageError.message}`);
  }

  const { data, error } = await supabase
    .from("campaign_image_records")
    .delete()
    .eq("storage_path", storagePath)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`DB delete failed: ${error.message}`);
  }

  return !!data;
}

export async function readCampaignImagesByCampaign(
  campaignId: number,
): Promise<HydratedCampaignImageRecord[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("campaign_image_records")
    .select("id, campaign_id, storage_path, display_order, is_main")
    .eq("campaign_id", campaignId)
    .order("is_main", { ascending: false })
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error reading campaign images:", error.message);
    return [];
  }

  const imageRecords = (data ?? []) as CampaignImageRecord[];
  if (imageRecords.length === 0) {
    return [];
  }

  const bucket = supabase.storage.from("campaign_images");
  const hydratedImages = await Promise.all(
    imageRecords.map(async (record) => {
      const [{ data: signedUrlData, error: signedUrlError }, { data: infoData, error: infoError }] =
        await Promise.all([
          bucket.createSignedUrl(record.storage_path, 60 * 60),
          bucket.info(record.storage_path),
        ]);

      if (signedUrlError) {
        console.error(
          `Error creating signed URL for ${record.storage_path}:`,
          signedUrlError.message,
        );
        return null;
      }

      if (infoError) {
        console.error(
          `Error reading file info for ${record.storage_path}:`,
          infoError.message,
        );
      }

      return {
        ...record,
        signedUrl: signedUrlData.signedUrl,
        fileName: getDisplayFileName(record.storage_path, infoData?.name),
        fileSize: infoData?.size ?? 0,
      };
    }),
  );

  return hydratedImages.filter(
    (image): image is HydratedCampaignImageRecord => image !== null,
  );
}
