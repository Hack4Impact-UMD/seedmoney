"use server";
import { readCampaignServer } from "@/src/actions/db/campaigns";
import { readAnswersByCampaignId } from "@/src/actions/db/answers";
import { createServerClient } from "@/src/lib/supabase-client";
import { createServiceRoleClient } from "@/src/lib/supabase-service";
import type { Campaign } from "@/src/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET_NAME = "campaign_images";
const GIVEBUTTER_MAX_ATTEMPTS = 3;
const GIVEBUTTER_RETRY_BASE_DELAY_MS = 500;
const GIVEBUTTER_PUBLISH_REQUEST_INTERVAL_MS = 150;
const GIVEBUTTER_CAMPAIGN_TIME_ZONE = "America/New_York";
const GIVEBUTTER_CAMPAIGN_SETTINGS = [
  {
    name: "hide_supporter_feed",
    value: true,
  },
  {
    name: "enforce_end_at",
    value: true,
  },
  {
    name: "disable_recurring",
    value: true,
  },
];
const GARDEN_STORY_HEADERS = [
  "Our Garden & Community",
  "Our Challenge",
  "Life in the Garden",
  "What Your Support Will Do",
];

type GivebutterFetch = (
  url: string,
  init: RequestInit,
) => Promise<Response>;

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

function createPacedGivebutterFetch(intervalMs: number): GivebutterFetch {
  let nextRequestAt = 0;
  let schedule = Promise.resolve();

  return async (url, init) => {
    const turn = schedule.then(async () => {
      const delay = Math.max(0, nextRequestAt - Date.now());

      if (delay > 0) {
        await wait(delay);
      }

      nextRequestAt = Date.now() + intervalMs;
    });

    schedule = turn;
    await turn;
    return fetch(url, init);
  };
}

function generateCampaignSlug(title: string, year: number): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug}-${year}`;
}

function getYearFromDateString(date: string) {
  const year = Number(date.slice(0, 4));
  return Number.isFinite(year) ? year : new Date(date).getFullYear();
}

function formatGivebutterEndAt(endDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw new Error(`Invalid competition end date: ${endDate}`);
  }

  const timeZoneName = new Intl.DateTimeFormat("en-US", {
    timeZone: GIVEBUTTER_CAMPAIGN_TIME_ZONE,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(`${endDate}T12:00:00Z`))
    .find((part) => part.type === "timeZoneName")?.value;
  const utcOffset = timeZoneName?.replace("GMT", "");

  if (!utcOffset || !/^[+-]\d{2}:\d{2}$/.test(utcOffset)) {
    throw new Error(`Unable to resolve Eastern time offset for ${endDate}`);
  }

  return `${endDate}T12:00:00${utcOffset}`;
}

function formatLocationSubtitle(
  campaign: Pick<Campaign, "city" | "state" | "country">,
) {
  return [campaign.city, campaign.state, campaign.country]
    .map((part) => part.trim())
    .filter((part) => part !== "" && part.toLowerCase() !== "n/a")
    .join(", ");
}

function buildGardenStoryDescription(answers: string[], imageUrls: string[]) {
  return GARDEN_STORY_HEADERS.flatMap((header, index) => {
    const blocks = [`<h3>${header}</h3>`, `<p>${answers[index] ?? ""}</p>`];
    const imageUrl = imageUrls[index];

    if (imageUrl) {
      blocks.push(`<img src="${imageUrl}" alt="Campaign image" />`);
    }

    if (index === GARDEN_STORY_HEADERS.length - 1) {
      blocks.push(
        ...imageUrls
          .slice(GARDEN_STORY_HEADERS.length)
          .flatMap((url) => [
            "<p>&nbsp;</p>",
            `<img src="${url}" alt="Campaign image" />`,
          ]),
      );
    }

    return blocks;
  }).join("\n\n");
}

async function fetchGivebutterWithRetry(
  url: string,
  init: RequestInit,
  request: GivebutterFetch = fetch,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < GIVEBUTTER_MAX_ATTEMPTS; attempt += 1) {
    let response: Response | null = null;

    try {
      response = await request(url, init);

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

  const campaigns = await readCampaignServer(campaignIds) as Campaign[];
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

  const competitionIds = [
    ...new Set(
      campaigns
        .map((campaign) => campaign.competition_id)
        .filter((id): id is number => id !== null),
    ),
  ];
  const { data: competitions, error: competitionError } = competitionIds.length
    ? await supabase
        .from("competition_metadata")
        .select("competition_id, start_date, end_date")
        .in("competition_id", competitionIds)
    : { data: [], error: null };

  if (competitionError) {
    throw new Error(`Failed to fetch competition metadata: ${competitionError.message}`);
  }

  const competitionById = new Map(
    (competitions ?? []).map((competition) => [
      competition.competition_id,
      competition,
    ]),
  );

  const results = await Promise.allSettled(
    campaigns.map(async (campaign) => {
      const competition = campaign.competition_id === null
        ? null
        : competitionById.get(campaign.competition_id);

      if (!competition?.end_date) {
        throw new Error(
          `Campaign ${campaign.campaign_id} has no competition end date`,
        );
      }

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
      const supportingImageUrls = supportingImagesArray.map((image) =>
        getPublicUrl(image.storage_path),
      );
      const description = buildGardenStoryDescription(
        [q1, q2, q3, q4],
        supportingImageUrls,
      );

      const body = {
        type: "fundraise",
        title: campaign.name,
        subtitle: formatLocationSubtitle(campaign),
        description,
        end_at: formatGivebutterEndAt(competition.end_date),
        settings: GIVEBUTTER_CAMPAIGN_SETTINGS,
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
          body: JSON.stringify({
            published: false,
            settings: GIVEBUTTER_CAMPAIGN_SETTINGS,
            slug: generateCampaignSlug(
              campaign.name,
              getYearFromDateString(competition.start_date),
            ),
          }),
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
  const supabase = createServiceRoleClient();

  const { data: competition, error: compError } = await supabase
    .from("competition_metadata")
    .select("competition_id, start_date, end_date")
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

  // 150ms between starts caps this job at 400 requests/minute, leaving
  // headroom below Givebutter's 500 requests/minute limit.
  const pacedGivebutterFetch = createPacedGivebutterFetch(
    GIVEBUTTER_PUBLISH_REQUEST_INTERVAL_MS,
  );

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
            body: JSON.stringify({
              published: true,
              settings: GIVEBUTTER_CAMPAIGN_SETTINGS,
            }),
          },
          pacedGivebutterFetch,
        );

        if (!response.ok) {
          const error = await readErrorBody(response);
          throw new Error(`Givebutter error (${response.status}): ${JSON.stringify(error)}`);
        }

        const { error: updateError } = await supabase
          .from("campaigns")
          .update({ status: "published" })
          .eq("campaign_id", campaign.campaign_id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        try {
          const { error: emailError } = await supabase.functions.invoke(
            "send-campaign-email",
            {
              body: {
                type: "campaign_live",
                campaign_id: campaign.campaign_id,
                donation: {
                  campaign_end_date: competition.end_date ?? "",
                },
              },
            },
          );

          if (emailError) {
            console.error(
              `Error sending campaign live email for campaign ${campaign.campaign_id}:`,
              emailError.message,
            );
          }
        } catch (emailError) {
          console.error(
            `Error sending campaign live email for campaign ${campaign.campaign_id}:`,
            emailError,
          );
        }
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
