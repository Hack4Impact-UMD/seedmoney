import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import leaderboardTypography from "./leaderboardTypography.module.css";
import type { LeaderboardGrantStat } from "./grantStatOptions";
import { grantStatOptions } from "./grantStatOptions";

type LeaderboardGrantStatPanelProps = {
  selectedGrantStat: LeaderboardGrantStat | null;
  onGrantSelect: (value: LeaderboardGrantStat) => void;
};

export default function LeaderboardGrantStatPanel({
  selectedGrantStat,
  onGrantSelect,
}: LeaderboardGrantStatPanelProps) {
  return (
    <div className="flex max-h-[70vh] w-full max-w-[360px] flex-col overflow-hidden rounded-[22px] border border-[#D8D7D2] bg-[#FCF9F2] shadow-[0_12px_32px_rgba(18,58,30,0.18)]">
      <div className="bg-[#123A1E] px-8 py-7 text-white">
        <h3
          className={`${leaderboardTypography.openSans} text-[20px] font-bold leading-[1.2]`}
        >
          Grant Leaderboard
        </h3>
        <p
          className={`${leaderboardTypography.openSans} mt-3 text-[14px] leading-[1.45] text-white/85`}
        >
          Campaigns compete for $100-$1,000 grants. The more you raise, the
          larger the grant you can earn. Learn more about how it works
        </p>
      </div>

      <div className="overflow-y-auto bg-[#FCF9F2]">
        {grantStatOptions.map((grantOption, index) => {
          const isSelected = selectedGrantStat === grantOption.id;

          return (
            <button
              key={grantOption.id}
              type="button"
              onClick={() => onGrantSelect(grantOption.id)}
              className={[
                "flex w-full items-center justify-between px-8 py-5 text-left transition-colors",
                index !== grantStatOptions.length - 1
                  ? "border-b border-[#E5E2DB]"
                  : "",
                isSelected ? "bg-[#EEF6EE]" : "hover:bg-[#F4F0E7]",
              ].join(" ")}
            >
              <div>
                <p
                  className={`${leaderboardTypography.openSans} text-[18px] font-bold leading-[1.2] text-[#163422]`}
                >
                  {grantOption.grantLabel}
                </p>
                {grantOption.placeLabel && (
                  <p
                    className={`${leaderboardTypography.openSans} mt-1 text-[15px] leading-[1.35] text-[#4E5A50]`}
                  >
                    {grantOption.placeLabel}
                  </p>
                )}
              </div>

              <ArrowForwardIcon className="text-[#4E5A50]" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
