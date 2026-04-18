export type LeaderboardGrantStat =
  | "grant1000"
  | "grant900"
  | "grant800"
  | "grant600"
  | "grant500";

export type LeaderboardGrantStatOption = {
  id: LeaderboardGrantStat;
  grantLabel: string;
  placeLabel: string;
  minRank: number;
  maxRank: number;
};

export const grantStatOptions: LeaderboardGrantStatOption[] = [
  {
    id: "grant1000",
    grantLabel: "$1000 Grant",
    placeLabel: "1st Place",
    minRank: 1,
    maxRank: 1,
  },
  {
    id: "grant900",
    grantLabel: "$900 Grant",
    placeLabel: "2nd Place",
    minRank: 2,
    maxRank: 2,
  },
  {
    id: "grant800",
    grantLabel: "$800 Grant",
    placeLabel: "3rd Place",
    minRank: 3,
    maxRank: 3,
  },
  {
    id: "grant600",
    grantLabel: "$600 Grant",
    placeLabel: "4th - 9th Place",
    minRank: 4,
    maxRank: 9,
  },
  {
    id: "grant500",
    grantLabel: "$500 Grant",
    placeLabel: "10th - 18th Place",
    minRank: 10,
    maxRank: 18,
  },
];
