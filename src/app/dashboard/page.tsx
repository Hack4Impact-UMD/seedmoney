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
import useReadCampaignImageUrlsByCampaignIds from "@/src/hooks/campaign-image-records/useReadCampaignImageUrlsByCampaignIds";
import InformationSection from "@/src/components/dashboard/InformationSection";
import BaseModal from "@/src/components/bases/BaseModal";
import { Button } from "@mui/material";
import { Logout } from "@mui/icons-material";

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
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<
    number | null
  >(null);

  const { data: userData, isLoading: isLoadingUser } = useUserByAuthId(
    user?.id || "",
  );
  const { data: campaigns = [], isLoading: isLoadingCampaigns } =
    useReadCampaignsFromMembers(user?.id || "");
  const { data: allCampaigns = [], isLoading: isLoadingAll } =
    useReadAllCampaigns();
  const {
    data: currentCompetitionData,
    isLoading: isLoadingCurrentCompetition,
  } = useReadCurrentCompetition();
  const { data: allCompetitions = [] } = useReadAllCompetitions();

  const isAdmin = !!userData?.is_admin;

  const effectiveCompetitionId =
    selectedCompetitionId ?? currentCompetitionData?.competition_id ?? null;

  const selectedCompetition = useMemo(() => {
    return (
      allCompetitions.find(
        (c) => c.competition_id === effectiveCompetitionId,
      ) ??
      currentCompetitionData ??
      null
    );
  }, [allCompetitions, effectiveCompetitionId, currentCompetitionData]);

  const selectedYear = selectedCompetition?.start_date
    ? moment(selectedCompetition.start_date).format("YYYY")
    : moment().format("YYYY");

  const daysLeft = selectedCompetition?.end_date
    ? Math.max(0, moment(selectedCompetition.end_date).diff(moment(), "days"))
    : null;

  const startDate = selectedCompetition?.start_date ?? null;
  const endDate = selectedCompetition?.end_date ?? null;
  const selectedCompetitionKey = selectedCompetition?.competition_id ?? null;

  const elapsedPercent = useMemo(() => {
    if (!startDate || !endDate) return null;

    const start = moment(startDate);
    const end = moment(endDate);
    const now = moment();
    const total = end.diff(start);

    if (total <= 0) return 100;

    const elapsed = now.diff(start);
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  }, [startDate, endDate]);

  const competitionCampaigns = useMemo(() => {
    return allCampaigns.filter(
      (c) =>
        !selectedCompetitionKey || c.competition_id === selectedCompetitionKey,
    );
  }, [allCampaigns, selectedCompetitionKey]);

  const sortedCampaigns = useMemo(() => {
    const copy = [...competitionCampaigns].filter(
      (c) => c.status === "published",
    );

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
    const donationsReceived = sortedCampaigns.reduce(
      (sum, c) => sum + (c.donors ?? 0),
      0,
    );

    const ongoingCampaigns = sortedCampaigns.length;

    const totalRaised = sortedCampaigns.reduce(
      (sum, c) => sum + (c.raised ?? 0),
      0,
    );

    return { donationsReceived, ongoingCampaigns, totalRaised };
  }, [sortedCampaigns]);

  const topCampaigns = useMemo(() => {
    return sortedCampaigns.slice(0, 6);
  }, [sortedCampaigns]);

  const topCampaignIds = useMemo(() => {
    return topCampaigns.map((c) => c.campaign_id);
  }, [topCampaigns]);

  const { data: imageUrlsByCampaignId = {} } =
    useReadCampaignImageUrlsByCampaignIds(topCampaignIds);

  const isLoading = isLoadingUser || isLoadingCampaigns;

  const preferredUserCampaign = useMemo(() => {
    if (campaigns.length === 0) {
      return null;
    }

    const currentCompetitionId = currentCompetitionData?.competition_id;
    const statusPriority: Record<string, number> = {
      published: 0,
      in_progress: 1,
      pending: 2,
      approved: 3,
      denied: 4,
      publish_failed: 5,
      archived: 6,
    };

    return [...campaigns].sort((a, b) => {
      const aIsCurrent = a.competition_id === currentCompetitionId ? 1 : 0;
      const bIsCurrent = b.competition_id === currentCompetitionId ? 1 : 0;

      if (aIsCurrent !== bIsCurrent) {
        return bIsCurrent - aIsCurrent;
      }

      const aStatusPriority =
        statusPriority[a.status] ?? Number.MAX_SAFE_INTEGER;
      const bStatusPriority =
        statusPriority[b.status] ?? Number.MAX_SAFE_INTEGER;

      if (aStatusPriority !== bStatusPriority) {
        return aStatusPriority - bStatusPriority;
      }

      return (
        moment(b.date_created, "YYYY-MM-DD").valueOf() -
        moment(a.date_created, "YYYY-MM-DD").valueOf()
      );
    })[0];
  }, [campaigns, currentCompetitionData?.competition_id]);

  const shouldRedirectToPreferredCampaign =
    !isLoadingUser &&
    !isLoadingCampaigns &&
    !isLoadingCurrentCompetition &&
    !!userData &&
    !!preferredUserCampaign &&
    !userData.is_admin;

  useEffect(() => {
    if (shouldRedirectToPreferredCampaign) {
      router.replace(`/dashboard/${preferredUserCampaign.campaign_id}`);
    }
  }, [
    preferredUserCampaign,
    router,
    isLoadingUser,
    isLoadingCampaigns,
    isLoadingCurrentCompetition,
    shouldRedirectToPreferredCampaign,
    userData,
  ]);

  if (shouldRedirectToPreferredCampaign) {
    return null;
  }


  const handleNewCampaign = () => {
    setOpenApplyModal(true);
  };

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
                value={effectiveCompetitionId ?? ""}
                onChange={(e) =>
                  setSelectedCompetitionId(Number(e.target.value))
                }
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

        {isLoading && <div className="mt-10 text-gray-500">Loading...</div>}

        {userData && !isAdmin && (
          <div className="mt-10 flex flex-col gap-6">
            <NotStarted onNewCampaign={handleNewCampaign} />
            <InformationSection />

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
                <h4 className="text-lg font-semibold text-[#054A1F]">
                  Top Campaigns
                </h4>

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
              ) : topCampaigns.length === 0 ? (
                <div className="bg-white rounded-lg border border-[#e5e5e5] p-8 text-center text-gray-500">
                  No campaigns yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topCampaigns.map((c, i) => (
                    <CampaignCard
                      key={c.campaign_id}
                      campaign={c}
                      rank={i + 1}
                      imageUrl={imageUrlsByCampaignId[c.campaign_id] ?? null}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <BaseModal
        open={openApplyModal}
        onClose={() => setOpenApplyModal(false)}
        title="SeedMoney Challenge Application"
      >
        <p className="text-gray-500 text-base mb-4">
          SeedMoney supports nonprofit and community-based food garden projects
          through a combination of online fundraising tools and grant funding.
        </p>

        <ul className="list-disc pl-5 mb-4">
          <li className="text-black text-base">
            By completing this application, you are applying to participate in the
            SeedMoney Challenge and to run a 30-day online fundraising campaign
            supported by SeedMoney running from{" "}
            {moment(currentCompetitionData?.start_date).format("MM/DD/YYYY")}-
            {moment(currentCompetitionData?.end_date).format("MM/DD/YYYY")}
          </li>
        </ul>

        <p className="text-gray-500 text-base mb-6">
          Most applicants complete this application in 20–30 minutes.
        </p>

        <div className="flex justify-end">
          <Button
            variant="contained"
            size="medium"
            onClick={handleNewCampaign}
            endIcon={<Logout />}
          >
            Start Application
          </Button>
          
        </div>
        
      </BaseModal>
    </div>
  );
}
