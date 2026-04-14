import Link from "next/link";
import type { Campaign } from "@/src/types/db/campaigns";

type CampaignCardProps = {
  campaign: Campaign;
};

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const { campaign_id, name, raised, goal, donors, project_category } = campaign;

  const percent = goal > 0 ? Math.round((raised / goal) * 100) : 0;
  const barWidth = Math.min(100, percent);

  const description =
    project_category && project_category.length > 0
      ? project_category
      : "Campaign raising funds to support its mission and community impact.";

  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5] overflow-hidden flex flex-col">
      <div className="relative h-36 bg-[#2D7A45] flex items-center justify-center">
        <span className="text-white text-lg font-semibold text-center px-4 line-clamp-2">
          {name}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h4 className="text-lg font-bold text-gray-900 mb-1 truncate">{name}</h4>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>

        <div className="mt-auto">
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold text-gray-900">
              ${raised.toLocaleString()}
            </span>{" "}
            of ${goal.toLocaleString()}
          </p>

          <div className="relative h-2 rounded-full bg-[#56bd604a] overflow-hidden mb-2">
            <div
              className="absolute inset-y-0 left-0 bg-[#56BD60] rounded-full"
              style={{ width: `${barWidth}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 mb-4">
            {donors.toLocaleString()} {donors === 1 ? "donor" : "donors"}
          </p>

          <Link
            href={`/dashboard/ongoing-campaigns/${campaign_id}`}
            className="block w-full text-center border border-[#2D7A45] text-[#2D7A45] font-semibold py-2 rounded-md hover:bg-[#2D7A45] hover:text-white transition-colors"
          >
            VIEW CAMPAIGN →
          </Link>
        </div>
      </div>
    </div>
  );
}
