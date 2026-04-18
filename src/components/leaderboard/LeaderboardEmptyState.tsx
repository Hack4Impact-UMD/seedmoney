import leaderboardTypography from "./leaderboardTypography.module.css";

type LeaderboardEmptyStateProps = {
  title: string;
  description: string;
};

export default function LeaderboardEmptyState({
  title,
  description,
}: LeaderboardEmptyStateProps) {
  return (
    <div className="rounded-[16px] border border-[#D9E3DB] bg-white px-8 py-14 text-center shadow-[0_8px_24px_rgba(18,58,30,0.06)]">
      <h2
        className={`${leaderboardTypography.goldplay} text-[28px] font-bold text-[#163422]`}
      >
        {title}
      </h2>
      <p
        className={`${leaderboardTypography.openSans} mx-auto mt-3 max-w-[560px] text-[18px] leading-7 text-[#666666]`}
      >
        {description}
      </p>
    </div>
  );
}
