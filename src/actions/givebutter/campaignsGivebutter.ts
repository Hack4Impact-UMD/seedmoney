"use server";
import { readCampaign } from "@/src/actions/db/campaigns";
import { readAnswersByCampaignId } from "@/src/actions/db/answers";
import { createServerClient } from "@/src/lib/supabase-client";
import type { Campaign } from "@/src/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET_NAME = "campaign_images";
const GIVEBUTTER_MAX_ATTEMPTS = 3;
const GIVEBUTTER_RETRY_BASE_DELAY_MS = 500;

const getPublicUrl = (storagePath: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;

function isRetryableGivebutterStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

function getRetryDelayMs(response: Response | null, attempt: number) {
  const retryAfter = response?.headers.get("retry-after");
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : NaN;

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }

  return GIVEBUTTER_RETRY_BASE_DELAY_MS * 2 ** attempt;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateCampaignSlug(title: string, dateCreated: string): string {
  const year = new Date(dateCreated).getFullYear();
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug}-${year}`;
}

async function fetchGivebutterWithRetry(
  url: string,
  init: RequestInit,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < GIVEBUTTER_MAX_ATTEMPTS; attempt += 1) {
    let response: Response | null = null;

    try {
      response = await fetch(url, init);

      if (
        response.ok ||
        !isRetryableGivebutterStatus(response.status) ||
        attempt === GIVEBUTTER_MAX_ATTEMPTS - 1
      ) {
        return response;
      }
    } catch (error) {
      lastError = error;

      if (attempt === GIVEBUTTER_MAX_ATTEMPTS - 1) {
        throw error;
      }
    }

    await wait(getRetryDelayMs(response, attempt));
  }

  throw lastError;
}

async function readErrorBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return response.statusText;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function createGivebutterCampaigns(campaignIds: number[]) {
  const supabase = await createServerClient();

  const campaigns = await readCampaign(campaignIds) as Campaign[];
  if (!campaigns || campaigns.length === 0) {
    throw new Error("No campaigns found");
  }

  const { data: imageRecords, error: imageError } = await supabase
    .from("campaign_image_records")
    .select("id, campaign_id, storage_path, display_order, is_main")
    .in("campaign_id", campaignIds)
    .order("is_main", { ascending: false })
    .order("display_order", { ascending: true });

  if (imageError) {
    throw new Error(`Failed to fetch image records: ${imageError.message}`);
  }

  const results = await Promise.allSettled(
    campaigns.map(async (campaign) => {
      const campaignImages = (imageRecords ?? []).filter(
        (r) => r.campaign_id === campaign.campaign_id,
      );

      const mainImage = campaignImages.find((r) => r.is_main === true);

      const answers = await readAnswersByCampaignId(campaign.campaign_id);
      const sortedAnswers = answers.sort(
        (a, b) => (a.questions?.question_number ?? 0) - (b.questions?.question_number ?? 0),
      );

      const [q1, q2, q3, q4] = sortedAnswers.map((a) => a.final_answer ?? "");

      const supportingImagesArray = campaignImages.filter((r) => r.is_main === false);
      const image1 = supportingImagesArray[0] ? `<img src="${getPublicUrl(supportingImagesArray[0].storage_path)}" alt="Campaign image" />` : '';
      const image2 = supportingImagesArray[1] ? `<img src="${getPublicUrl(supportingImagesArray[1].storage_path)}" alt="Campaign image" />` : '';
      const restImages = supportingImagesArray.slice(2).map((r) => `<img src="${getPublicUrl(r.storage_path)}" alt="Campaign image" />`).join("\n");

      const description = `
        <h3>Our Garden & Community</h3>
        <p>${q1}</p>
        ${image1}

        <h3>Our Challenge</h3>
        <p>${q2}</p>

        <h3>Seasonal Activity</h3>
        <p>${q3}</p>
        ${image2}

        <h3>Campaign Impact</h3>
        <p>${q4}</p>

        ${restImages}
      `.trim();

      const body = {
        type: "fundraise",
        title: campaign.name,
        subtitle: campaign.state === "N/A" 
          ? `${campaign.city}, ${campaign.country}` 
          : `${campaign.city}, ${campaign.state} ${campaign.country}`,
        description,
        ...(campaign.goal !== undefined && { goal: campaign.goal }),
        ...(mainImage && {
          cover: {
            source: "upload",
            type: "image",
            url: getPublicUrl(mainImage.storage_path),
          },
        }),
      };

      // Do not retry this POST without an idempotency key; a lost response
      // after a successful create could duplicate campaigns in Givebutter.
      const createResponse = await fetch(
        "https://api.givebutter.com/v1/campaigns",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GIVEBUTTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!createResponse.ok) {
        const error = await readErrorBody(createResponse);
        throw new Error(`Failed to create campaign (${createResponse.status}): ${JSON.stringify(error)}`);
      }

      const givebutterCampaign = await createResponse.json();

      const patchResponse = await fetchGivebutterWithRetry(
        `https://api.givebutter.com/v1/campaigns/${givebutterCampaign.id}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${process.env.GIVEBUTTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ published: 0 }),
        },
      );

      if (!patchResponse.ok) {
        const error = await readErrorBody(patchResponse);
        throw new Error(`Failed to unpublish campaign (${patchResponse.status}): ${JSON.stringify(error)}`);
      }

      return {
        ...(await patchResponse.json()),
        campaignId: campaign.campaign_id,
      };
    }),
  );

  return results;
}


export async function publishDueCampaigns() {
  const supabase = await createServerClient();

  const { data: competition, error: compError } = await supabase
    .from("competition_metadata")
    .select("competition_id, start_date")
    .eq("is_current", true)
    .single();

  if (compError || !competition) throw new Error("No current competition found");

  // Not time yet
  if (new Date(competition.start_date) > new Date()) return;

  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("campaign_id, givebutter_id")
    .eq("competition_id", competition.competition_id)
    .eq("status", "approved");

  if (error) throw new Error(error.message);
  if (!campaigns?.length) return;

  const results = await Promise.allSettled(
    campaigns.map(async (campaign) => {
      try {
        const response = await fetchGivebutterWithRetry(
          `https://api.givebutter.com/v1/campaigns/${campaign.givebutter_id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${process.env.GIVEBUTTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ published: 1 }),
          },
        );

        if (!response.ok) {
          const error = await readErrorBody(response);
          throw new Error(`Givebutter error (${response.status}): ${JSON.stringify(error)}`);
        }

        await supabase
          .from("campaigns")
          .update({ status: "published" })
          .eq("campaign_id", campaign.campaign_id);
      } catch (err) {
        await supabase
          .from("campaigns")
          .update({ status: "publish_failed" })
          .eq("campaign_id", campaign.campaign_id);
        throw err;
      }
    }),
  );

  return results;
}