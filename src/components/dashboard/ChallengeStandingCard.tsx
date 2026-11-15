import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { rankGrantTiers } from "../leaderboard/grantStatOptions";

const lastGrantRank = rankGrantTiers.at(-1)?.maxRank;

export function ChallengeStandingCard({
  rank,
  totalProjects,
  projectedGrant,
  grantTierMinRank,
  grantTierMaxRank,
  updateTime,
}: {
  rank: number | null;
  totalProjects: number | null;
  projectedGrant: number | null;
  grantTierMinRank: number | null;
  grantTierMaxRank: number | null;
  updateTime: string | null;
}) {
  function ordinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function formatUpdateTime(iso: string) {
    const formatted = new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
    return formatted;
  }

  const isRanked = rank !== null;
  const hasGrant =
    projectedGrant !== null &&
    grantTierMinRank !== null &&
    grantTierMaxRank !== null;

  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5] p-4 md:p-6 overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-700 font-medium text-sm md:text-base">
            Challenge Standing
          </p>
          {updateTime && (
            <p className="text-gray-500 text-xs md:text-sm">
              As of {formatUpdateTime(updateTime)}
            </p>
          )}
        </div>
        <EmojiEventsOutlinedIcon className="text-gray-400"></EmojiEventsOutlinedIcon>
      </div>
      <div className="mt-4 flex flex-col divide-y divide-[#e5e5e5] md:flex-row md:divide-x md:divide-y-0">
        <div className="flex-1 pb-4 md:pb-0 md:pr-8">
          <p className="text-xs text-gray-500 md:text-sm">
            Estimated rank right now
          </p>
          {isRanked ? (
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-[28px] font-bold leading-none text-gray-900 md:text-3xl md:leading-9">
                #{rank}
              </span>
              <span className="text-xs text-gray-500 md:text-sm">
                of {totalProjects} projects
              </span>
            </p>
          ) : (
            <>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-gray-900 md:text-3xl">
                  -
                </span>
                <span className="text-xs text-gray-500 md:text-sm">
                  Your campaign is not ranked. Only published campaigns in the
                  Challenge appear in standings.
                </span>
              </p>
            </>
          )}
        </div>

        <div className="flex-1 pt-4 md:pt-0 md:pl-8">
          <p className="text-xs text-gray-500 md:text-sm">
            Estimated grant if the Challenge ended now
          </p>
          {hasGrant ? (
            <>
              <p className="mt-2 text-[28px] font-bold leading-none text-gray-900 md:text-3xl md:leading-9">
                ${projectedGrant?.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-gray-500 md:text-sm">
                {grantTierMinRank === grantTierMaxRank
                  ? `${ordinal(grantTierMinRank)} place earns $${projectedGrant.toLocaleString()}`
                  : `Ranks ${ordinal(grantTierMinRank)}–${ordinal(grantTierMaxRank)} currently earn $${projectedGrant.toLocaleString()}`}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-[28px] font-bold text-gray-900 md:text-3xl">
                -
              </p>

              <p className="mt-1 text-xs text-gray-500 md:text-sm">
                Grants only go to the top {lastGrantRank} campaigns.
              </p>
            </>
          )}
        </div>
      </div>
      <div className="bg-[#F6FAF9] mt-4 rounded-md p-3 flex-1 flex items-start gap-2 md:p-4">
        <span className="text-gray-500">
          <InfoOutlinedIcon
            sx={{ fontSize: 16, position: "relative", top: "-4px" }}
          />
        </span>
        <p className="text-xs text-gray-500 md:text-sm">
          <b>This is a snapshot, not your final grant.</b> Rankings change as
          donations come in, and final grants are set when the Challenge ends.
          This information is subject to change.
        </p>
      </div>
    </div>
  );
}
