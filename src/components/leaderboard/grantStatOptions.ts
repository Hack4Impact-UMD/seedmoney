export type LeaderboardGrantStat =
  | "grant1000"
  | "grant900"
  | "grant800"
  | "grant600"
  | "grant500"
  | "grant400"
  | "grant300"
  | "grant200"
  | "grant100"
  | "strongStart"
  | "strongFinish"
  | "geographicInterest";

export type LeaderboardGrantStatOption = {
  id: LeaderboardGrantStat;
  grantLabel: string;
  placeLabel?: string;
  minRank?: number;
  maxRank?: number;
  amount?: number;
};

export const grantStatOptions: LeaderboardGrantStatOption[] = [
  {
    id: "grant1000",
    grantLabel: "$1000 Grant",
    placeLabel: "1st Place",
    minRank: 1,
    maxRank: 1,
    amount: 1000,
  },
  {
    id: "grant900",
    grantLabel: "$900 Grant",
    placeLabel: "2nd Place",
    minRank: 2,
    maxRank: 2,
    amount: 900,
  },
  {
    id: "grant800",
    grantLabel: "$800 Grant",
    placeLabel: "3rd Place",
    minRank: 3,
    maxRank: 3,
    amount: 800,
  },
  {
    id: "grant600",
    grantLabel: "$600 Grant",
    placeLabel: "4th - 9th Place",
    minRank: 4,
    maxRank: 9,
    amount: 600,
  },
  {
    id: "grant500",
    grantLabel: "$500 Grant",
    placeLabel: "10th - 18th Place",
    minRank: 10,
    maxRank: 18,
    amount: 500,
  },
  {
    id: "grant400",
    grantLabel: "$400 Grant",
    placeLabel: "19th - 36th Place",
    minRank: 19,
    maxRank: 36,
    amount: 400,
  },
  {
    id: "grant300",
    grantLabel: "$300 Grant",
    placeLabel: "37th - 72nd Place",
    minRank: 37,
    maxRank: 72,
    amount: 300,
  },
  {
    id: "grant200",
    grantLabel: "$200 Grant",
    placeLabel: "73rd - 144th Place",
    minRank: 73,
    maxRank: 144,
    amount: 200,
  },
  {
    id: "grant100",
    grantLabel: "$100 Grant",
    placeLabel: "145th - 288th Place",
    minRank: 145,
    maxRank: 288,
    amount: 100,
  },
  {
    id: "strongStart",
    grantLabel: "51 Strong Start Grant",
  },
  {
    id: "strongFinish",
    grantLabel: "23 Strong Finish Grant",
  },
  {
    id: "geographicInterest",
    grantLabel: "70 Geographic Interest Grants",
  },
];

export type RankGrantTier = LeaderboardGrantStatOption & {
  amount: number;
  minRank: number;
  maxRank: number;
};

function isRankGrantTier(
  option: LeaderboardGrantStatOption,
): option is RankGrantTier {
  return (
    option.amount !== undefined &&
    option.minRank !== undefined &&
    option.maxRank !== undefined
  );
}

export const rankGrantTiers = grantStatOptions.filter(isRankGrantTier);

export function getRankGrantTier(
  rank: number | null | undefined,
): RankGrantTier | null {
  if (rank == null) return null;
  return (
    rankGrantTiers.find(
      (tier) => rank >= tier.minRank && rank <= tier.maxRank,
    ) ?? null
  );
}
