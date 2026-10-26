import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CardHeader } from "./CardHeader";

export function ChallengeStandingCard({
  rank,
  totalProjects,
  projectedGrant,
  grantTierMinRank,
  grantTierMaxRank,
}: {
  rank: number;
  totalProjects: number;
  projectedGrant: number;
  grantTierMinRank: number | null;
  grantTierMaxRank: number | null;
}) {
  function ordinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5] p-4 md:p-6 overflow-hidden">
      <CardHeader
        label="Challenge Standing"
        icon={<EmojiEventsOutlinedIcon />}
      />
      <div className="mt-4 flex flex-col divide-y divide-[#e5e5e5] md:flex-row md:divide-x md:divide-y-0">
        <div className="flex-1 pb-4 md:pb-0 md:pr-8">
          <p className="text-sm text-gray-500">Your current rank</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">#{rank}</span>
            <span className="text-sm text-gray-500">
              of {totalProjects} projects
            </span>
          </p>
        </div>

        <div className="flex-1 pt-4 md:pt-0 md:pl-8">
          <p className="text-sm text-gray-500">
            Grant you&apos;d get if the Challenge ended today
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ${projectedGrant.toLocaleString()}
          </p>
          {grantTierMinRank != null && grantTierMaxRank != null && (
            <p className="mt-1 text-sm text-gray-500">
              {`Rank ${ordinal(grantTierMinRank)}–${ordinal(grantTierMaxRank)} earns $${projectedGrant.toLocaleString()}`}
            </p>
          )}
        </div>
      </div>
      <div className="bg-[#F6FAF9] mt-4 rounded-md p-4 flex-1 flex items-end gap-2">
        <span className="text-gray-500">
          <InfoOutlinedIcon sx={{ fontSize: 16 }} />
        </span>
        <p className="text-sm text-gray-500">
          Your rank and grant updates as rankings change, and are final only
          when the Challenge ends.
        </p>
      </div>
    </div>
  );
}
