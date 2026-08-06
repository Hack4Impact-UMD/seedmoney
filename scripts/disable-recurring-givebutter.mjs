import { createClient } from "@supabase/supabase-js";

const GIVEBUTTER_API_URL = "https://api.givebutter.com/v1/campaigns";
const GIVEBUTTER_MAX_ATTEMPTS = 3;
const GIVEBUTTER_RETRY_BASE_DELAY_MS = 500;
const GIVEBUTTER_REQUEST_INTERVAL_MS = 150;
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

function formatGivebutterEndAt(endDate) {
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
    return text;
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

async function updateGivebutterCampaign(
  campaign,
  endAt,
  apiKey,
  pacedFetch,
) {
  for (let attempt = 0; attempt < GIVEBUTTER_MAX_ATTEMPTS; attempt += 1) {
    let response = null;

    try {
      response = await pacedFetch(
        `${GIVEBUTTER_API_URL}/${encodeURIComponent(campaign.givebutter_id)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            end_at: endAt,
            settings: GIVEBUTTER_CAMPAIGN_SETTINGS,
          }),
        },
      );
    } catch (error) {
      if (attempt === GIVEBUTTER_MAX_ATTEMPTS - 1) {
        throw error;
      }

      await wait(getRetryDelayMs(null, attempt));
      continue;
    }

    if (response.ok) {
      return;
    }

    if (
      !isRetryableStatus(response.status) ||
      attempt === GIVEBUTTER_MAX_ATTEMPTS - 1
    ) {
      const error = await readErrorBody(response);
      throw new Error(
        `Givebutter error (${response.status}): ${JSON.stringify(error)}`,
      );
    }

    await wait(getRetryDelayMs(response, attempt));
  }
}

function printUsage() {
  console.log(`Usage:
  npm run givebutter:disable-recurring
  npm run givebutter:disable-recurring -- --apply
  npm run givebutter:disable-recurring -- --apply --campaign-id=123`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const shouldApply = process.argv.includes("--apply");
  const campaignId = getCampaignIdArgument();
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
    .select("competition_id, end_date")
    .eq("is_current", true)
    .single();

  if (competitionError || !competition) {
    throw new Error(
      competitionError?.message ?? "No current competition found",
    );
  }

  if (!competition.end_date) {
    throw new Error("The current competition has no end date");
  }

  let campaignsQuery = supabase
    .from("campaigns")
    .select("campaign_id, name, givebutter_id, status")
    .eq("competition_id", competition.competition_id)
    .in("status", ["approved", "published", "publish_failed"])
    .not("givebutter_id", "is", null)
    .order("campaign_id", { ascending: true });

  if (campaignId !== null) {
    campaignsQuery = campaignsQuery.eq("campaign_id", campaignId);
  }

  const { data: campaigns, error: campaignsError } = await campaignsQuery;

  if (campaignsError) {
    throw new Error(campaignsError.message);
  }

  const campaignsToUpdate = campaigns ?? [];
  const endAt = formatGivebutterEndAt(competition.end_date);

  console.log(
    `Found ${campaignsToUpdate.length} Givebutter campaign(s) ending at ${endAt}.`,
  );

  if (!shouldApply) {
    console.log("Dry run only. Add --apply to update Givebutter.");
    return;
  }

  if (campaignsToUpdate.length === 0) {
    return;
  }

  const apiKey = getRequiredEnv("GIVEBUTTER_API_KEY");
  const pacedFetch = createPacedFetch();
  const failures = [];

  for (const [index, campaign] of campaignsToUpdate.entries()) {
    try {
      await updateGivebutterCampaign(campaign, endAt, apiKey, pacedFetch);
      console.log(
        `[${index + 1}/${campaignsToUpdate.length}] Updated ${campaign.campaign_id}: ${campaign.name}`,
      );
    } catch (error) {
      failures.push({ campaign, error });
      console.error(
        `[${index + 1}/${campaignsToUpdate.length}] Failed ${campaign.campaign_id}: ${campaign.name}`,
        error,
      );
    }
  }

  console.log(
    `Finished with ${campaignsToUpdate.length - failures.length} updated and ${failures.length} failed.`,
  );

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
