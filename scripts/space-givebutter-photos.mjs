import { createClient } from "@supabase/supabase-js";

const GIVEBUTTER_API_URL = "https://api.givebutter.com/v1/campaigns";
const GIVEBUTTER_MAX_ATTEMPTS = 3;
const GIVEBUTTER_RETRY_BASE_DELAY_MS = 500;
const GIVEBUTTER_REQUEST_INTERVAL_MS = 150;
const GARDEN_STORY_SECTION_COUNT = 4;
const COLLAPSIBLE_SPACER_PATTERN =
  /<p\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\s*(<img\b[^>]*\/?>)/giu;
const ADJACENT_IMAGES_PATTERN =
  /(<img\b[^>]*\/?>)\s*(<img\b[^>]*\/?>)/giu;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

function getCampaignIdArgument() {
  const argument = process.argv.find((value) => value.startsWith("--campaign-id="));

  if (!argument) {
    return null;
  }

  const campaignId = Number(argument.slice("--campaign-id=".length));

  if (!Number.isInteger(campaignId) || campaignId <= 0) {
    throw new Error("--campaign-id must be a positive integer");
  }

  return campaignId;
}

function isRetryableStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

function getRetryDelayMs(response, attempt) {
  const retryAfter = response?.headers.get("retry-after");
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : Number.NaN;

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }

  return GIVEBUTTER_RETRY_BASE_DELAY_MS * 2 ** attempt;
}

async function readErrorBody(response) {
  const text = await response.text();

  if (!text) {
    return response.statusText;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text.slice(0, 500);
  }
}

function createPacedFetch() {
  let nextRequestAt = 0;

  return async (url, init) => {
    const delay = Math.max(0, nextRequestAt - Date.now());

    if (delay > 0) {
      await wait(delay);
    }

    nextRequestAt = Date.now() + GIVEBUTTER_REQUEST_INTERVAL_MS;
    return fetch(url, init);
  };
}

async function fetchWithRetry(url, init, pacedFetch) {
  let lastError;

  for (let attempt = 0; attempt < GIVEBUTTER_MAX_ATTEMPTS; attempt += 1) {
    let response = null;

    try {
      response = await pacedFetch(url, init);

      if (
        response.ok ||
        !isRetryableStatus(response.status) ||
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

function addPhotoSpacing(description) {
  return description
    .replace(COLLAPSIBLE_SPACER_PATTERN, "<p>$1</p>")
    .replace(ADJACENT_IMAGES_PATTERN, "$1\n\n<p>$2</p>");
}

function printUsage() {
  console.log(`Usage:
  npm run givebutter:space-photos
  npm run givebutter:space-photos -- --apply
  npm run givebutter:space-photos -- --apply --campaign-id=123`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const shouldApply = process.argv.includes("--apply");
  const campaignId = getCampaignIdArgument();
  const apiKey = getRequiredEnv("GIVEBUTTER_API_KEY");
  const supabase = createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const { data: competition, error: competitionError } = await supabase
    .from("competition_metadata")
    .select("competition_id")
    .eq("is_current", true)
    .single();

  if (competitionError || !competition) {
    throw new Error(
      competitionError?.message ?? "No current competition found",
    );
  }

  let campaignsQuery = supabase
    .from("campaigns")
    .select("campaign_id, name, givebutter_id")
    .eq("competition_id", competition.competition_id)
    .in("status", ["approved", "published", "publish_failed"])
    .not("givebutter_id", "is", null)
    .order("campaign_id", { ascending: true });

  if (campaignId !== null) {
    campaignsQuery = campaignsQuery.eq("campaign_id", campaignId);
  }

  const { data: campaignRows, error: campaignsError } = await campaignsQuery;

  if (campaignsError) {
    throw new Error(campaignsError.message);
  }

  const campaigns = (campaignRows ?? []).filter(
    (campaign) => campaign.givebutter_id?.trim() !== "",
  );
  const campaignIds = campaigns.map((campaign) => campaign.campaign_id);

  if (campaignIds.length === 0) {
    console.log("No Givebutter campaigns found.");
    return;
  }

  const { data: imageRows, error: imagesError } = await supabase
    .from("campaign_image_records")
    .select("campaign_id, is_main")
    .in("campaign_id", campaignIds);

  if (imagesError) {
    throw new Error(imagesError.message);
  }

  const supportingImageCounts = new Map();

  for (const image of imageRows ?? []) {
    if (!image.is_main) {
      supportingImageCounts.set(
        image.campaign_id,
        (supportingImageCounts.get(image.campaign_id) ?? 0) + 1,
      );
    }
  }

  const overflowCampaigns = campaigns.filter(
    (campaign) =>
      (supportingImageCounts.get(campaign.campaign_id) ?? 0) >
      GARDEN_STORY_SECTION_COUNT,
  );
  const pacedFetch = createPacedFetch();
  const pendingUpdates = [];
  const failures = [];

  console.log(
    `Checking ${overflowCampaigns.length} campaign(s) with overflow photos.`,
  );

  for (const campaign of overflowCampaigns) {
    try {
      const response = await fetchWithRetry(
        `${GIVEBUTTER_API_URL}/${encodeURIComponent(campaign.givebutter_id)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
        },
        pacedFetch,
      );

      if (!response.ok) {
        const error = await readErrorBody(response);
        throw new Error(
          `Givebutter error (${response.status}): ${JSON.stringify(error)}`,
        );
      }

      const body = await response.json();
      const description = (body.data ?? body).description ?? "";
      const updatedDescription = addPhotoSpacing(description);

      if (updatedDescription !== description) {
        pendingUpdates.push({ campaign, description: updatedDescription });
        console.log(
          `Needs spacing ${campaign.campaign_id}: ${campaign.name}`,
        );
      }
    } catch (error) {
      failures.push({ campaign, error });
      console.error(
        `Failed to inspect ${campaign.campaign_id}: ${campaign.name}`,
        error,
      );
    }
  }

  console.log(
    `Found ${pendingUpdates.length} campaign(s) with adjacent photos.`,
  );

  if (!shouldApply) {
    console.log("Dry run only. Add --apply to update Givebutter.");
  } else {
    for (const [index, update] of pendingUpdates.entries()) {
      try {
        const response = await fetchWithRetry(
          `${GIVEBUTTER_API_URL}/${encodeURIComponent(update.campaign.givebutter_id)}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ description: update.description }),
          },
          pacedFetch,
        );

        if (!response.ok) {
          const error = await readErrorBody(response);
          throw new Error(
            `Givebutter error (${response.status}): ${JSON.stringify(error)}`,
          );
        }

        console.log(
          `[${index + 1}/${pendingUpdates.length}] Updated ${update.campaign.campaign_id}: ${update.campaign.name}`,
        );
      } catch (error) {
        failures.push({ campaign: update.campaign, error });
        console.error(
          `[${index + 1}/${pendingUpdates.length}] Failed ${update.campaign.campaign_id}: ${update.campaign.name}`,
          error,
        );
      }
    }
  }

  if (failures.length > 0) {
    console.error(`Finished with ${failures.length} failure(s).`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
