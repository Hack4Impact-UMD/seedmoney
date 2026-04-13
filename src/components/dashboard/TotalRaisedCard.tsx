import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { CardHeader } from "./CardHeader";

export function TotalRaisedCard({
  totalRaised,
  campaignGoal,
  raisedChangePercent,
}: {
  totalRaised: number;
  campaignGoal: number;
  raisedChangePercent: number | null;
}) {
  const campaignPercent = Math.min(
    100,
    Math.round((totalRaised / campaignGoal) * 100),
  );

  return (
    <div className="bg-white rounded-lg border border-1 border-[#e5e5e5] p-6">
      <CardHeader label="Total Raised" icon={<AttachMoneyIcon />} />

      {/* Progress bar */}
      <div className="relative h-1/3 rounded-full bg-[#56bd604a] overflow-hidden my-13">
        <div
          className="absolute inset-y-0 left-0 bg-[#56BD60] rounded-full flex items-center pl-3 min-w-14"
          style={{ width: `${campaignPercent}%` }}
        >
          <span className="text-white font-bold text-[0.95rem] whitespace-nowrap">
            {campaignPercent}%
          </span>
        </div>
      </div>

      {/* Amount */}
      <h2 className="text-3xl font-bold text-gray-900 mb-1">
        {`$${totalRaised.toLocaleString()}`}
      </h2>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {campaignPercent}% of {`$${campaignGoal.toLocaleString()}`} goal
        </p>
        <p
          className={`text-sm font-medium ${
            raisedChangePercent === null
              ? "text-gray-400"
              : raisedChangePercent < 0
                ? "text-[#D32F2F]"
                : "text-[#00A63E]"
          }`}
        >
          {raisedChangePercent === null
            ? "—% from last week"
            : `${raisedChangePercent > 0 ? "+" : ""}${raisedChangePercent}% from last week`}
        </p>
      </div>
    </div>
  );
}
