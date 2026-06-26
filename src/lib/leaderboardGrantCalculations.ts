import type { Campaign } from "@/src/types/db/campaigns";
import type { Transaction } from "@/src/types/db/transactions";

const DAY_MS = 24 * 60 * 60 * 1000;

export type LeaderboardGrantTransaction = Pick<
  Transaction,
  "amount_donated" | "campaign_id" | "date" | "status" | "transacted_at"
>;

export type SpecialGrantCampaignIds = {
  strongStart: number[] | null;
  strongFinish: number[] | null;
  geographicInterest: number[];
};

type CalculateSpecialGrantCampaignIdsInput = {
  campaigns: Campaign[];
  transactions: LeaderboardGrantTransaction[];
  competitionStartDate?: string | null;
  competitionEndDate?: string | null;
  asOf?: Date;
};

const nonGlobalSouthCountries = new Set(
  [
    "Andorra",
    "Australia",
    "Austria",
    "Bahrain",
    "Belgium",
    "Brunei",
    "Canada",
    "Croatia",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Estonia",
    "Finland",
    "France",
    "Germany",
    "Greece",
    "Hungary",
    "Iceland",
    "Ireland {Republic}",
    "Israel",
    "Italy",
    "Japan",
    "Korea South",
    "Kuwait",
    "Latvia",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Netherlands",
    "New Zealand",
    "Norway",
    "Poland",
    "Portugal",
    "Qatar",
    "Saudi Arabia",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Sweden",
    "Switzerland",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
  ].map(normalizeLocationValue),
);

function normalizeLocationValue(value: string) {
  return value.trim().toLowerCase();
}

function getDateMs(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  const time = date.getTime();

  return Number.isNaN(time) ? null : time;
}

function getTransactionMs(transaction: LeaderboardGrantTransaction) {
  return getDateMs(transaction.transacted_at || transaction.date);
}

function isSuccessfulDonation(transaction: LeaderboardGrantTransaction) {
  const status = transaction.status.trim().toLowerCase();

  return ["succeeded", "paid", "complete", "completed"].includes(status);
}

function getWindowTotals(
  campaignIds: Set<number>,
  transactions: LeaderboardGrantTransaction[],
  startMs: number,
  endMs: number,
) {
  const totals = new Map<number, number>();

  transactions.forEach((transaction) => {
    if (
      !campaignIds.has(transaction.campaign_id) ||
      !isSuccessfulDonation(transaction)
    ) {
      return;
    }

    const transactionMs = getTransactionMs(transaction);

    if (
      transactionMs === null ||
      transactionMs < startMs ||
      transactionMs >= endMs
    ) {
      return;
    }

    totals.set(
      transaction.campaign_id,
      (totals.get(transaction.campaign_id) ?? 0) +
        transaction.amount_donated,
    );
  });

  return totals;
}

function getTopCampaignIds(
  totals: Map<number, number>,
  campaignsById: Map<number, Campaign>,
  limit: number,
) {
  return [...totals.entries()]
    .filter(([, amountRaised]) => amountRaised > 0)
    .sort(([leftCampaignId, leftAmount], [rightCampaignId, rightAmount]) => {
      const amountDifference = rightAmount - leftAmount;

      if (amountDifference !== 0) {
        return amountDifference;
      }

      const leftCampaign = campaignsById.get(leftCampaignId);
      const rightCampaign = campaignsById.get(rightCampaignId);
      const raisedDifference =
        (rightCampaign?.raised ?? 0) - (leftCampaign?.raised ?? 0);

      if (raisedDifference !== 0) {
        return raisedDifference;
      }

      return leftCampaignId - rightCampaignId;
    })
    .slice(0, limit)
    .map(([campaignId]) => campaignId);
}

function uniqueCampaignIds(campaignIds: number[]) {
  return [...new Set(campaignIds)];
}

function isMaineCampaign(campaign: Campaign) {
  const country = normalizeLocationValue(campaign.country);
  const state = normalizeLocationValue(campaign.state);
  const isUnitedStates = country === "united states" || country === "us";

  return isUnitedStates && (state === "me" || state === "maine");
}

function isGlobalSouthCampaign(campaign: Campaign) {
  const country = normalizeLocationValue(campaign.country);

  return country !== "" && !nonGlobalSouthCountries.has(country);
}

export function calculateSpecialGrantCampaignIds({
  campaigns,
  transactions,
  competitionStartDate,
  competitionEndDate,
  asOf = new Date(),
}: CalculateSpecialGrantCampaignIdsInput): SpecialGrantCampaignIds {
  const campaignIds = new Set(
    campaigns.map((campaign) => campaign.campaign_id),
  );
  const campaignsById = new Map(
    campaigns.map((campaign) => [campaign.campaign_id, campaign]),
  );
  const startMs = getDateMs(competitionStartDate);
  const endMs = getDateMs(competitionEndDate);
  const nowMs = asOf.getTime();
  const firstDayEndMs = startMs === null ? null : startMs + DAY_MS;
  const firstWeekEndMs = startMs === null ? null : startMs + 7 * DAY_MS;
  const finalWeekStartMs = endMs === null ? null : endMs - 7 * DAY_MS;

  const strongStart =
    startMs === null || firstDayEndMs === null || firstWeekEndMs === null
      ? null
      : nowMs < firstWeekEndMs
        ? null
        : uniqueCampaignIds([
            ...getTopCampaignIds(
              getWindowTotals(campaignIds, transactions, startMs, firstDayEndMs),
              campaignsById,
              1,
            ),
            ...getTopCampaignIds(
              getWindowTotals(
                campaignIds,
                transactions,
                startMs,
                firstWeekEndMs,
              ),
              campaignsById,
              50,
            ),
          ]);

  const strongFinish =
    endMs === null || finalWeekStartMs === null
      ? null
      : nowMs < endMs
        ? null
        : getTopCampaignIds(
            getWindowTotals(campaignIds, transactions, finalWeekStartMs, endMs),
            campaignsById,
            23,
          );

  const geographicInterest = campaigns
    .filter(
      (campaign) => isMaineCampaign(campaign) || isGlobalSouthCampaign(campaign),
    )
    .map((campaign) => campaign.campaign_id);

  return {
    strongStart,
    strongFinish,
    geographicInterest,
  };
}
