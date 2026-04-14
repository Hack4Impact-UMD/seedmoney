"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import moment from "moment";
import NotStarted from "@/src/components/dashboard/NotStarted";
import Navbar from "@/src/components/Navbar";
import SummaryCard from "@/src/components/dashboard/SummaryCard";
import CampaignCard from "@/src/components/dashboard/CampaignCard";
import { useAuth } from "@/src/context/AuthProvider";
import useUserByAuthId from "@/src/hooks/users/useUserByAuthId";
import useReadCampaignsFromMembers from "@/src/hooks/campaign-members/useReadCampaignsFromMembers";
import useReadAllCampaigns from "@/src/hooks/campaigns/useReadAllCampaigns";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";

type SortKey = "most_raised" | "least_raised" | "most_donors";

export default function DashboardIndexPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("most_raised");

  const { data: userData, isLoading: isLoadingUser } = useUserByAuthId(user?.id || "");
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useReadCampaignsFromMembers(user?.id || "");
  const isAdmin = !!userData?.is_admin;

  const { data: allCampaigns = [], isLoading: isLoadingAll } = useReadAllCampaigns({ enabled: isAdmin });
  const { data: currentCompetitionData } = useReadCurrentCompetition({ enabled: isAdmin });

  useEffect(() => {
    if (isLoadingUser || isLoadingCampaigns) return;
    if (!userData) return;

    if (campaigns.length > 0 && !userData.is_admin) {
      router.replace(`/dashboard/${campaigns[0].campaign_id}`);
    }
  }, [userData, campaigns, isLoadingUser, isLoadingCampaigns, router]);

  const handleNewCampaign = () => {
    router.push("/apply");
  };

  const currentYear = currentCompetitionData?.start_date
    ? moment(currentCompetitionData.start_date).format("YYYY")
    : moment().format("YYYY");

  const daysLeft = currentCompetitionData?.end_date
    ? Math.max(0, moment(currentCompetitionData.end_date).diff(moment(), "days"))
    : null;

  const competitionCampaigns = useMemo(
    () =>
      allCampaigns.filter(
        (c) =>
          !currentCompetitionData?.competition_id ||
          c.competition_id === currentCompetitionData.competition_id,
      ),
    [allCampaigns, currentCompetitionData?.competition_id],
  );

  const sortedCampaigns = useMemo(() => {
    const copy = [...competitionCampaigns];
    switch (sortKey) {
      case "most_raised":
        copy.sort((a, b) => (b.raised ?? 0) - (a.raised ?? 0));
        break;
      case "least_raised":
        copy.sort((a, b) => (a.raised ?? 0) - (b.raised ?? 0));
        break;
      case "most_donors":
        copy.sort((a, b) => (b.donors ?? 0) - (a.donors ?? 0));
        break;
    }
    return copy;
  }, [competitionCampaigns, sortKey]);

  const stats = useMemo(() => {
    const donationsReceived = competitionCampaigns.reduce(
      (sum, c) => sum + (c.donors ?? 0),
      0,
    );
    const ongoingCampaigns = competitionCampaigns.filter(
      (c) => c.status === "approved" || c.status === "published",
    ).length;
    const totalRaised = competitionCampaigns.reduce(
      (sum, c) => sum + (c.raised ?? 0),
      0,
    );
    return { donationsReceived, ongoingCampaigns, totalRaised };
  }, [competitionCampaigns]);

  const isLoading = isLoadingUser || isLoadingCampaigns;

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gray-50 p-10">
        <div className="flex items-center gap-4 flex-wrap">
          <h3 className="text-4xl font-bold text-[#096B2E]">
            {isAdmin ? "Home" : "Dashboard"}
          </h3>
          {isAdmin && (
            <>
              <span className="inline-flex items-center gap-1 bg-white border border-gray-300 rounded-md px-3 py-1 text-sm font-medium text-gray-700">
                {currentYear}
              </span>
              {daysLeft !== null && (
                <span className="text-sm text-gray-500">
                  {daysLeft} days left in this year&apos;s campaign
                </span>
              )}
            </>
          )}
        </div>

        {isLoading && (
          <div className="mt-10 text-gray-500">Loading...</div>
        )}

        {userData && !isAdmin && (
          <div className="mt-10 flex items-center justify-center">
            <NotStarted onNewCampaign={handleNewCampaign} />
          </div>
        )}

        {isAdmin && (
          <>
            <h4 className="mt-8 mb-4 text-lg font-semibold text-gray-900">
              Quick Statistics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard
                label="Donations Received"
                value={stats.donationsReceived.toLocaleString()}
              />
              <SummaryCard
                label="Ongoing Campaigns"
                value={stats.ongoingCampaigns.toLocaleString()}
              />
              <SummaryCard
                label="Total Raised"
                value={`$${stats.totalRaised.toLocaleString()}`}
              />
            </div>

            <div className="mt-10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-semibold text-gray-900">Top Campaigns</h4>
                <span className="inline-flex items-center bg-[#56bd604a] text-[#2D7A45] rounded-full px-3 py-0.5 text-xs font-semibold">
                  {currentYear}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <span>Sort by:</span>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="border border-gray-300 rounded px-3 py-2 bg-white outline-none cursor-pointer font-medium text-gray-700"
                  >
                    <option value="most_raised">Most Raised</option>
                    <option value="least_raised">Least Raised</option>
                    <option value="most_donors">Most Donors</option>
                  </select>
                </label>
                <Link
                  href="/dashboard/ongoing-campaigns"
                  className="text-sm font-semibold text-[#2D7A45] hover:underline"
                >
                  VIEW ALL CAMPAIGNS →
                </Link>
              </div>
            </div>

            <div className="mt-6">
              {isLoadingAll ? (
                <div className="text-gray-500">Loading campaigns...</div>
              ) : sortedCampaigns.length === 0 ? (
                <div className="bg-white rounded-lg border border-[#e5e5e5] p-8 text-center text-gray-500">
                  No campaigns yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedCampaigns.map((c) => (
                    <CampaignCard key={c.campaign_id} campaign={c} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
