"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import moment from "moment";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import NotStarted from "@/src/components/dashboard/NotStarted";
import Navbar from "@/src/components/Navbar";
import SummaryCard from "@/src/components/dashboard/SummaryCard";
import CampaignCard from "@/src/components/dashboard/CampaignCard";
import { useAuth } from "@/src/context/AuthProvider";
import useUserByAuthId from "@/src/hooks/users/useUserByAuthId";
import useReadCampaignsFromMembers from "@/src/hooks/campaign-members/useReadCampaignsFromMembers";
import useReadAllCampaigns from "@/src/hooks/campaigns/useReadAllCampaigns";
import useReadCurrentCompetition from "@/src/hooks/competition-metadata/useReadCurrentCompetition";
import useReadAllCompetitions from "@/src/hooks/competition-metadata/useReadAllCompetitions";

type SortKey = "most_raised" | "least_raised" | "most_donors";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "most_raised", label: "Most Raised" },
  { key: "least_raised", label: "Least Raised" },
  { key: "most_donors", label: "Most Donors" },
];

export default function DashboardIndexPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("most_raised");
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | null>(null);

  const { data: userData, isLoading: isLoadingUser } = useUserByAuthId(user?.id || "");
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useReadCampaignsFromMembers(user?.id || "");
  const isAdmin = !!userData?.is_admin;

  const { data: allCampaigns = [], isLoading: isLoadingAll } = useReadAllCampaigns({ enabled: isAdmin });
  const { data: currentCompetitionData } = useReadCurrentCompetition({ enabled: isAdmin });
  const { data: allCompetitions = [] } = useReadAllCompetitions({ enabled: isAdmin });

  useEffect(() => {
    if (selectedCompetitionId === null && currentCompetitionData?.competition_id) {
      setSelectedCompetitionId(currentCompetitionData.competition_id);
    }
  }, [selectedCompetitionId, currentCompetitionData?.competition_id]);

  const selectedCompetition = useMemo(
    () =>
      allCompetitions.find((c) => c.competition_id === selectedCompetitionId) ??
      currentCompetitionData ??
      null,
    [allCompetitions, selectedCompetitionId, currentCompetitionData],
  );

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

  const selectedYear = selectedCompetition?.start_date
    ? moment(selectedCompetition.start_date).format("YYYY")
    : moment().format("YYYY");

  const daysLeft = selectedCompetition?.end_date
    ? Math.max(0, moment(selectedCompetition.end_date).diff(moment(), "days"))
    : null;

  const elapsedPercent = useMemo(() => {
    if (!selectedCompetition?.start_date || !selectedCompetition?.end_date) return null;
    const start = moment(selectedCompetition.start_date);
    const end = moment(selectedCompetition.end_date);
    const now = moment();
    const total = end.diff(start);
    if (total <= 0) return 100;
    const elapsed = now.diff(start);
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }, [selectedCompetition?.start_date, selectedCompetition?.end_date]);

  const competitionCampaigns = useMemo(
    () =>
      allCampaigns.filter(
        (c) =>
          !selectedCompetition?.competition_id ||
          c.competition_id === selectedCompetition.competition_id,
      ),
    [allCampaigns, selectedCompetition?.competition_id],
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
          <h3 className="text-4xl font-bold text-[#054A1F]">
            {isAdmin ? "Home" : "Dashboard"}
          </h3>
          {isAdmin && (
            <>
              <select
                value={selectedCompetitionId ?? ""}
                onChange={(e) => setSelectedCompetitionId(Number(e.target.value))}
                className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm font-medium text-gray-700 outline-none cursor-pointer"
              >
                {allCompetitions.length === 0 && (
                  <option value="">{selectedYear}</option>
                )}
                {allCompetitions.map((c) => (
                  <option key={c.competition_id} value={c.competition_id}>
                    {moment(c.start_date).format("YYYY")}
                  </option>
                ))}
              </select>
              {daysLeft !== null && (
                <div className="flex items-center gap-3 min-w-[420px]">
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {daysLeft} days left in this year&apos;s campaign
                  </span>
                  <div className="relative h-2 w-40 rounded-full bg-[#56bd604a] overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#56BD60] rounded-full"
                      style={{ width: `${elapsedPercent ?? 0}%` }}
                    />
                  </div>
                </div>
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
            <h4 className="mt-8 mb-4 text-lg font-semibold text-[#054A1F]">
              Quick Statistics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard
                label="Donations Received"
                value={stats.donationsReceived.toLocaleString()}
                icon={<VolunteerActivismIcon fontSize="small" />}
              />
              <SummaryCard
                label="Ongoing Campaigns"
                value={stats.ongoingCampaigns.toLocaleString()}
                icon={<OutlinedFlagIcon fontSize="small" />}
              />
              <SummaryCard
                label="Total Raised"
                value={`$${stats.totalRaised.toLocaleString()}`}
                icon={<AttachMoneyIcon fontSize="small" />}
              />
            </div>

            <div className="mt-10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h4 className="text-lg font-semibold text-[#054A1F]">Top Campaigns</h4>
                <div className="flex items-center gap-2">
                  {SORT_OPTIONS.map((opt) => {
                    const active = sortKey === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setSortKey(opt.key)}
                        className={`text-sm font-medium rounded-full px-4 py-1.5 border transition-colors ${
                          active
                            ? "bg-[#2D7A45] text-white border-[#2D7A45]"
                            : "bg-white text-[#2D7A45] border-[#2D7A45] hover:bg-[#e8f5ec]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Link
                href="/dashboard/ongoing-campaigns"
                className="text-sm font-semibold text-[#2D7A45] hover:underline"
              >
                VIEW ALL CAMPAIGNS →
              </Link>
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
                  {sortedCampaigns.map((c, i) => (
                    <CampaignCard key={c.campaign_id} campaign={c} rank={i + 1} />
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
