import { createBrowserClient } from "@/src/lib/supabase-client";
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
  const supabase = createBrowserClient();

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

export async function readCampaignImageUrlsByCampaignIds(
  campaignIds: number[],
): Promise<Record<number, string | null>> {
  if (campaignIds.length === 0) {
    return {};
  }

  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("campaign_image_records")
    .select("campaign_id, storage_path, display_order, is_main")
    .in("campaign_id", campaignIds)
    .order("campaign_id", { ascending: true })
    .order("is_main", { ascending: false })
    .order("display_order", { ascending: true });

  if (error) {
    console.error(
      "Error reading campaign images by campaign ids:",
      error.message,
    );
    return {};
  }

  const firstImageByCampaign = new Map<number, string>();
  for (const imageRecord of data ?? []) {
    if (!firstImageByCampaign.has(imageRecord.campaign_id)) {
      firstImageByCampaign.set(imageRecord.campaign_id, imageRecord.storage_path);
    }
  }

  const imageEntries = await Promise.all(
    Array.from(firstImageByCampaign.entries()).map(
      async ([campaignId, storagePath]) => {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("campaign_images")
            .createSignedUrl(storagePath, 60 * 60);

        if (signedUrlError) {
          console.error(
            `Error creating signed URL for ${storagePath}:`,
            signedUrlError.message,
          );
          return [campaignId, null] as const;
        }

        return [campaignId, signedUrlData.signedUrl] as const;
      },
    ),
  );

  return Object.fromEntries(imageEntries);
}

export async function updateCampaignImageRecord(
  id: number,
  data: Partial<Pick<CampaignImageRecord, "is_main" | "display_order">>,
): Promise<CampaignImageRecord | null> {
  const supabase = createBrowserClient();

  const { data: updatedData, error } = await supabase
    .from("campaign_image_records")
    .update(data)
    .eq("id", id)
    .select("id, campaign_id, storage_path, display_order, is_main")
    .single();

  if (error) {
    console.error("Error updating campaign image record:", error.message);
    return null;
  }

  return updatedData as CampaignImageRecord;
}

export async function replaceCampaignImage({
  file,
  campaignId,
  oldStoragePath,
}: {
  file: File;
  campaignId: number;
  oldStoragePath: string;
}): Promise<CampaignImageRecord> {
  const supabase = createBrowserClient();

  const fileName = file.name.replace(/\s+/g, "-");
  const newFilePath = `campaigns/${campaignId}/${crypto.randomUUID()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("campaign_images")
    .upload(newFilePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data, error: updateError } = await supabase
    .from("campaign_image_records")
    .update({ storage_path: newFilePath })
    .eq("campaign_id", campaignId)
    .eq("storage_path", oldStoragePath)
    .select("id, campaign_id, storage_path, display_order, is_main")
    .single();

  if (updateError) {
    await supabase.storage.from("campaign_images").remove([newFilePath]);
    throw new Error(`DB update failed: ${updateError.message}`);
  }

  const { error: removeError } = await supabase.storage
    .from("campaign_images")
    .remove([oldStoragePath]);

  if (removeError) {
    console.error(
      `Storage cleanup failed for ${oldStoragePath}:`,
      removeError.message,
    );
  }

  return data;
}

export async function setMainCampaignImage(
  campaignId: number,
  newMainId: number,
): Promise<void> {
  const supabase = createBrowserClient();

  // Set all to false first
  const { error: resetError } = await supabase
    .from("campaign_image_records")
    .update({ is_main: false })
    .eq("campaign_id", campaignId);

  if (resetError) {
    throw new Error(`Failed to reset main image: ${resetError.message}`);
  }

  // Set new main to true
  const { error: setError } = await supabase
    .from("campaign_image_records")
    .update({ is_main: true })
    .eq("id", newMainId);

  if (setError) {
    throw new Error(`Failed to set main image: ${setError.message}`);
  }
}
