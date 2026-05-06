import Link from "next/link";
import type { Campaign } from "@/src/types/db/campaigns";

type CampaignCardProps = {
  campaign: Campaign;
  rank?: number;
  imageUrl?: string | null;
};

function ordinal(n: number) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function rankStyle(rank: number) {
  switch (rank) {
    case 1:
      return "bg-[#F5C518] text-[#4A3A00]";
    case 2:
      return "bg-[#C0C0C0] text-[#2B2B2B]";
    case 3:
      return "bg-[#CD7F32] text-white";
    default:
      return "bg-[#2D7A45] text-white";
  }
}

export default function CampaignCard({
  campaign,
  rank,
  imageUrl,
}: CampaignCardProps) {
  const {
    campaign_id,
    name,
    raised = 0,
    goal = 0,
    donors = 0,
    project_category,
  } = campaign;

  const percent =
    (goal ?? 0) > 0 ? Math.round(((raised ?? 0) / (goal ?? 0)) * 100) : 0;

  const barWidth = Math.min(100, percent);

  const description =
    project_category && project_category.length > 0
      ? project_category
      : "Campaign raising funds to support its mission and community impact.";

  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden flex flex-col">
      <div
        className="relative h-36 bg-[#2D7A45] bg-cover bg-center flex items-center justify-center"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        {imageUrl && <div className="absolute inset-0 bg-black/50" />}
        {rank !== undefined && (
          <span
            className={`absolute top-3 left-3 rounded-full px-3 py-0.5 text-xs font-bold z-10 ${rankStyle(rank)}`}
          >
            {ordinal(rank)}
          </span>
        )}
        <span className="text-white text-lg font-semibold text-center px-4 line-clamp-2 relative z-10">
          {name}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h4 className="text-lg font-bold text-gray-900 mb-1 truncate">
          {name}
        </h4>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>

        <div className="mt-auto">
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold text-gray-900">
              ${(raised ?? 0).toLocaleString()}
            </span>{" "}
            of of ${(goal ?? 0).toLocaleString()}
          </p>

          <div className="relative h-2 rounded-full bg-[#56bd604a] overflow-hidden mb-2">
            <div
              className="absolute inset-y-0 left-0 bg-[#56BD60] rounded-full"
              style={{ width: `${barWidth}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 mb-4">
            {(donors ?? 0).toLocaleString()}{" "}
            {(donors ?? 0) === 1 ? "donor" : "donors"}
          </p>

          <Link
            href={`/dashboard/approved-campaigns/${campaign_id}`}
            className="block w-full text-center border border-[#2D7A45] text-[#2D7A45] font-semibold py-2 rounded-md hover:bg-[#2D7A45] hover:text-white transition-colors"
          >
            VIEW CAMPAIGN →
          </Link>
        </div>
      </div>
    </div>
  );
}
