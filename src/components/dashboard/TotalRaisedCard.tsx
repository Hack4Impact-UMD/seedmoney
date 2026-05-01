import { CardHeader } from "./CardHeader";

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_3662_30664)">
      <path d="M10 1.6665V18.3332" stroke="#99A1AF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.1667 4.1665H7.91667C7.14312 4.1665 6.40125 4.47379 5.85427 5.02078C5.30729 5.56776 5 6.30962 5 7.08317C5 7.85672 5.30729 8.59858 5.85427 9.14557C6.40125 9.69255 7.14312 9.99984 7.91667 9.99984H12.0833C12.8569 9.99984 13.5987 10.3071 14.1457 10.8541C14.6927 11.4011 15 12.143 15 12.9165C15 13.6901 14.6927 14.4319 14.1457 14.9789C13.5987 15.5259 12.8569 15.8332 12.0833 15.8332H5" stroke="#99A1AF" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_3662_30664">
        <rect width="20" height="20" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

export function TotalRaisedCard({
  totalRaised,
  campaignGoal,
  raisedChangePercent,
}: {
  totalRaised: number;
  campaignGoal: number;
  raisedChangePercent: number | null;
}) {
  const campaignPercent =
    campaignGoal > 0 ? Math.round((totalRaised / campaignGoal) * 100) : 0;
  const progressBarPercent = Math.min(100, Math.max(0, campaignPercent));

  return (
    <div className="bg-white rounded-lg border border-[#e5e5e5] p-4 md:p-6 overflow-hidden">
      <CardHeader label="Total Raised" icon={<DollarIcon />} />

      {/* Progress bar */}
      <div className="relative h-3 rounded-full bg-[#56bd604a] overflow-hidden my-4">
        <div
          className="absolute inset-y-0 left-0 bg-[#56BD60] rounded-full"
          style={{ width: `${progressBarPercent}%` }}
        >
        </div>
      </div>

      {/* Amount */}
      <h2 className="text-3xl font-bold text-gray-900 mb-1">
        {`$${totalRaised.toLocaleString()}`}
      </h2>

      {/* Footer */}
      <div className="flex justify-between items-center gap-2 min-w-0">
        <p className="text-sm text-gray-500 truncate min-w-0">
          {campaignPercent}% of {`$${campaignGoal.toLocaleString()}`} goal
        </p>
        <p
          className={`text-sm font-medium shrink-0 ${
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
