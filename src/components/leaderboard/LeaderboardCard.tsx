import type { PublicLeaderboardCampaign } from "@/src/types/frontend/leaderboard";
import leaderboardTypography from "./leaderboardTypography.module.css";

type LeaderboardCardProps = {
  campaign: PublicLeaderboardCampaign;
  displayRank: number;
};

const rankStyles: Record<number, { label: string; className: string }> = {
  1: { label: "1st", className: "bg-[#FBBF24] text-black" },
  2: { label: "2nd", className: "bg-[#D4D4D4] text-black" },
  3: { label: "3rd", className: "bg-[#FB923C] text-black" },
};

function getProgressWidth(raised: number, goal: number) {
  if (goal <= 0) {
    return "0%";
  }

  return `${Math.min((raised / goal) * 100, 100)}%`;
}

export default function LeaderboardCard({
  campaign,
  displayRank,
}: LeaderboardCardProps) {
  const rankStyle = rankStyles[displayRank];

  return (
    <article className="rounded-[12px] bg-[#FCF9F2] px-[10px] py-5 shadow-[0_8px_24px_rgba(18,58,30,0.08)]">
      <div className="relative h-[247px] overflow-hidden rounded-[12px]">
        {campaign.imageUrl ? (
          <div
            aria-label={campaign.name}
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${campaign.imageUrl})` }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#163422_0%,#2D7A45_100%)] text-center text-white">
            <span className={`${leaderboardTypography.openSans} px-6 text-2xl font-bold`}>
              {campaign.name}
            </span>
          </div>
        )}

        {rankStyle && (
          <div
            className={`${leaderboardTypography.openSans} absolute left-[18px] top-3 rounded-full px-3 py-[3.5px] text-sm font-bold uppercase leading-4 ${rankStyle.className}`}
          >
            {rankStyle.label}
          </div>
        )}
      </div>

      <div className="px-2 pt-4">
        <h2
          className={`${leaderboardTypography.openSans} text-[24px] font-bold leading-[1.1] text-[#163422]`}
        >
          {campaign.name}
        </h2>
        <p className={`${leaderboardTypography.openSans} mt-2 text-[16px] text-[#727972]`}>
          {campaign.location}
        </p>
        <p
          className={`${leaderboardTypography.openSans} mt-2 min-h-[72px] text-[16px] font-bold leading-[1.45] text-[#424843]`}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {campaign.summary}
        </p>

        <div className="py-4">
          <div className="mb-1.5 flex items-center justify-between gap-4">
            <p className={`${leaderboardTypography.openSans} text-[16px] font-bold text-[#2B5A3F]`}>
              ${campaign.raised.toLocaleString()}{" "}
              <span className="font-normal text-[#666666]">
                of ${campaign.goal.toLocaleString()}
              </span>
            </p>
            <p className={`${leaderboardTypography.openSans} text-[13px] font-bold text-[#2B5A3F]`}>
              {campaign.donors.toLocaleString()} donations
            </p>
          </div>

          <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#E5E2DB]">
            <div
              className="h-full rounded-full bg-[linear-gradient(151deg,#163422_0%,#2D4B37_100%)]"
              style={{ width: getProgressWidth(campaign.raised, campaign.goal) }}
            />
          </div>
        </div>

        {campaign.donateUrl ? (
          <a
            href={campaign.donateUrl}
            target="_blank"
            rel="noreferrer"
            className={`${leaderboardTypography.openSans} flex h-[38px] w-full items-center justify-center rounded-[6px] bg-[#56BD60] text-[15px] font-bold capitalize text-[#142A19] transition hover:bg-[#4EAE58]`}
          >
            Donate
          </a>
        ) : (
          <div
            className={`${leaderboardTypography.openSans} flex h-[38px] w-full items-center justify-center rounded-[6px] bg-[#D8D7D2] text-[15px] font-bold capitalize text-[#666666]`}
          >
            Donate
          </div>
        )}
      </div>
    </article>
  );
}
