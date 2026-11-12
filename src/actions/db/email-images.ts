import { createBrowserClient } from "@/src/lib/supabase-client";

const BUCKET_NAME = "email_images";

export const MAX_EMAIL_IMAGE_BYTES = 3 * 1024 * 1024;

// Uploads an image for the email body and returns its public URL. The bucket
// is public so the image loads for email recipients who aren't logged in.
export async function uploadEmailImage(file: File): Promise<string> {
  const supabase = createBrowserClient();

  const fileName = file.name.replace(/\s+/g, "-");
  const filePath = `${crypto.randomUUID()}-${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data
    .publicUrl;
}
