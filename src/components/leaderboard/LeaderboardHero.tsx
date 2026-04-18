import Link from "next/link";
import leaderboardTypography from "./leaderboardTypography.module.css";

type LeaderboardHeroProps = {
  challengeTitle: string;
  totalCampaigns: number;
  totalRaised: number;
  totalDonors: number;
};

const heroDescription =
  "Each campaign below is competing for SeedMoney challenge grants ranging from $100 to $1,000. Your donation helps a garden grow and improves its ranking - the more a project raises, the larger the grant it qualifies for.";

export default function LeaderboardHero({
  challengeTitle,
  totalCampaigns,
  totalRaised,
  totalDonors,
}: LeaderboardHeroProps) {
  return (
    <section className="bg-[#123A1E] px-6 py-8 text-white md:px-10 lg:px-16">
      <div className="mx-auto flex max-w-[1728px] flex-col gap-8">
        <div className="flex justify-end gap-6 text-sm font-bold md:gap-10 md:text-[18px]">
          <span>{totalCampaigns.toLocaleString()} campaigns</span>
          <span>${totalRaised.toLocaleString()} raised</span>
          <span>{totalDonors.toLocaleString()} donors</span>
        </div>

        <div className="mx-auto max-w-[920px] text-center">
          <h1
            className={`${leaderboardTypography.goldplay} text-3xl font-bold md:text-[46px] md:leading-[1.1]`}
          >
            {challengeTitle}
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/90 md:text-[18px] md:leading-[1.45]">
            {heroDescription}
          </p>
        </div>

        <div className="text-sm text-white/90">
          <Link href="/" className="font-bold underline underline-offset-4">
            Home
          </Link>{" "}
          <span className="px-1">{">"}</span>
          <span className="font-semibold text-white">Leaderboard</span>
        </div>
      </div>
    </section>
  );
}
