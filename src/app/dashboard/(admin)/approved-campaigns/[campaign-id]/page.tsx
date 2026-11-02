"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import clsx from "clsx";

import Navbar from "@/src/components/Navbar";
import DonorsTable from "@/src/components/DonorsTable";
import DashboardTabs, {
  type DashboardTabItem,
} from "@/src/components/dashboard/DashboardTabs";
import { TotalRaisedCard } from "@/src/components/dashboard/TotalRaisedCard";
import { TotalDonorsCard } from "@/src/components/dashboard/TotalDonorsCard";
import { DaysRemainingCard } from "@/src/components/dashboard/DaysRemainingCard";
import { EarningsTrendCard } from "@/src/components/dashboard/EarningsTrendCard";
import {
  buildEarningsTrendData,
  transactionsToDailyEarnings,
} from "@/src/lib/utils/buildEarningsTrend";

import useReadCampaign from "@/src/hooks/campaigns/useReadCampaign";
import useReadCompetitionById from "@/src/hooks/competition-metadata/useReadCompetitionById";
import useReadCampaignTransactions from "@/src/hooks/transactions/useReadCampaignTransactions";
import useRaisedChangePercent from "@/src/hooks/transactions/useRaisedChangePercent";
import useDonorsChangePercent from "@/src/hooks/transactions/useDonorsChangePercent";
import useDeleteCampaign from "@/src/hooks/campaigns/useDeleteCampaign";
import {
  republishSuspendedGivebutterCampaign,
  unpublishGivebutterCampaign,
} from "@/src/actions/givebutter/campaignsGivebutter";

import { ArrowBack, Close, OpenInNew } from "@mui/icons-material";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import BaseModal from "@/src/components/bases/BaseModal";
import BaseAlert from "@/src/components/bases/BaseAlert";

const ADMIN_DASHBOARD_TABS: readonly DashboardTabItem[] = [
  { label: "Overview", sectionId: "dashboard-overview" },
  { label: "Donations", sectionId: "dashboard-donations" },
  { label: "Analytics", sectionId: "dashboard-analytics" },
];

export default function AdminCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const campaignIdParam = params["campaign-id"];
  const campaignId =
    typeof campaignIdParam === "string" ? Number(campaignIdParam) : NaN;

  const [toast, setToast] = useState(false);
  const [viewCampaignModal, setViewCampaignModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUnlockIn, setDeleteUnlockIn] = useState(0);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspendError, setSuspendError] = useState<string | null>(null);
  const suspendInFlightRef = useRef(false);
  const [isUnsuspendModalOpen, setIsUnsuspendModalOpen] = useState(false);
  const [isUnsuspending, setIsUnsuspending] = useState(false);
  const [unsuspendError, setUnsuspendError] = useState<string | null>(null);
  const unsuspendInFlightRef = useRef(false);

  const {
    mutate: deleteCampaign,
    isPending: isDeleting,
  } = useDeleteCampaign();

  const {
    data: campaignsData,
    isLoading: campaignLoading,
    error: campaignError,
  } = useReadCampaign({ campaignId });

  const campaignData = campaignsData?.[0] ?? null;

  const {
    data: competitionData,
    isLoading: competitionLoading,
  } = useReadCompetitionById(campaignData?.competition_id);

  const {
    data: transactions,
    isLoading: txnsLoading,
    isError: txnsError,
  } = useReadCampaignTransactions(campaignId);

  const {
    percent: raisedPercent,
    isLoading: raisedLoading,
    isError: raisedError,
  } = useRaisedChangePercent(campaignId, competitionData?.start_date);

  const {
    percent: donorsPercent,
    isLoading: donorsLoading,
    isError: donorsError,
  } = useDonorsChangePercent(campaignId, competitionData?.start_date);

  const raisedChangePercent =
    raisedLoading || raisedError ? null : raisedPercent;
  const donorsChangePercent =
    donorsLoading || donorsError ? null : donorsPercent;

  const isPastCampaign = competitionData?.is_current === false;

  const todayIso = isPastCampaign
    ? moment(competitionData?.end_date).format("YYYY-MM-DD")
    : moment().startOf("day").format("YYYY-MM-DD");

  const earnings = useMemo(
    () => transactionsToDailyEarnings(transactions ?? []),
    [transactions],
  );

  const { dates, dailyValues, totalValues } = useMemo(() => {
    const startDate = competitionData?.start_date;
    const endDate = competitionData?.end_date;

    if (earnings.length === 0 || !startDate || !endDate) {
      return { dates: [], dailyValues: [], totalValues: [] };
    }

    return buildEarningsTrendData(earnings, endDate, startDate);
  }, [earnings, competitionData?.start_date, competitionData?.end_date]);

  const handleBack = () => {
    router.push("/dashboard/approved-campaigns");
  };

  const handleOpenDeleteModal = () => {
    setDeleteUnlockIn(3);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteCampaign(campaignId, {
      onSuccess: () => router.push("/dashboard/approved-campaigns"),
      onError: (error) => setDeleteError(error.message),
    });
  };

  const closeSuspendModal = () => {
    if (suspendInFlightRef.current) return;
    setIsSuspendModalOpen(false);
    setSuspendError(null);
  };

  const handleConfirmSuspend = async () => {
    if (suspendInFlightRef.current) return;

    suspendInFlightRef.current = true;
    setIsSuspending(true);
    setSuspendError(null);
    try {
      await unpublishGivebutterCampaign(campaignId);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [{ campaignId }, "campaigns", "read"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["campaigns", "approved-campaigns"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["campaigns", "previous-campaigns"],
        }),
      ]);
      setIsSuspendModalOpen(false);
    } catch (error) {
      console.error("Failed to suspend campaign:", error);
      setSuspendError(
        error instanceof Error
          ? error.message
          : "Failed to suspend campaign. Please try again.",
      );
    } finally {
      suspendInFlightRef.current = false;
      setIsSuspending(false);
    }
  };

  const closeUnsuspendModal = () => {
    if (unsuspendInFlightRef.current) return;
    setIsUnsuspendModalOpen(false);
    setUnsuspendError(null);
  };

  const handleConfirmUnsuspend = async () => {
    if (unsuspendInFlightRef.current) return;

    unsuspendInFlightRef.current = true;
    setIsUnsuspending(true);
    setUnsuspendError(null);
    try {
      await republishSuspendedGivebutterCampaign(campaignId);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [{ campaignId }, "campaigns", "read"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["campaigns", "approved-campaigns"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["campaigns", "previous-campaigns"],
        }),
      ]);
      setIsUnsuspendModalOpen(false);
    } catch (error) {
      console.error("Failed to unsuspend campaign:", error);
      setUnsuspendError(
        error instanceof Error
          ? error.message
          : "Failed to unsuspend campaign. Please try again.",
      );
    } finally {
      unsuspendInFlightRef.current = false;
      setIsUnsuspending(false);
    }
  };

  useEffect(() => {
    if (!deleteModalOpen) return;

    const timer = window.setInterval(() => {
      setDeleteUnlockIn((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deleteModalOpen]);

  if (!Number.isFinite(campaignId)) {
    notFound();
  }

  if (campaignLoading || competitionLoading || txnsLoading) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 bg-gray-50 p-10">Loading...</div>
      </div>
    );
  }

  if (campaignError) {
    throw campaignError;
  }

  if (!campaignData) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 bg-gray-50 p-10">Unable to load campaign.</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Navbar />

      <div className="flex-1 flex-col bg-gray-50 p-10 space-y-3">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="text-4xl font-bold text-[#096B2E]">
            {campaignData.name}
          </h3>
          {(campaignData.status === "published" ||
            campaignData.status === "suspended") && (
            <div className="flex items-center gap-3">
              {campaignData.status === "suspended" && (
                <Chip variant="suspended" label="Suspended" />
              )}
              <span className="text-sm text-[#666666]">
                Created in{" "}
                {Number.isNaN(new Date(campaignData.date_created).getFullYear())
                  ? "N/A"
                  : new Date(campaignData.date_created).getFullYear()}
              </span>
              {campaignData.status === "suspended" ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setUnsuspendError(null);
                    setIsUnsuspendModalOpen(true);
                  }}
                >
                  Unsuspend
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSuspendError(null);
                    setIsSuspendModalOpen(true);
                  }}
                >
                  Suspend
                </Button>
              )}
            </div>
          )}
        </div>

        <p
          onClick={handleBack}
          className="cursor-pointer flex items-center uppercase !text-[#666666] text-sm font-bold"
        >
          <ArrowBack className="mr-1 !text-sm" fontSize="inherit" />
          Back
        </p>

        <DashboardTabs tabs={ADMIN_DASHBOARD_TABS} />

        <section id="dashboard-overview" className="scroll-mt-20 space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button
              size="small"
              variant="contained"
              onClick={() => setViewCampaignModal(true)}
            >
              View Campaign Site
              <OpenInNew fontSize="small" className="ml-[5px]" />
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    campaignData.givebutterlink ?? "",
                  );
                  setToast(true);
                } catch {
                  return;
                }
              }}
            >
              Copy Campaign Site Link
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() => router.push("/leaderboard")}
            >
              View Leaderboard
              <OpenInNew fontSize="small" className="ml-[5px]" />
            </Button>

            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                router.push(`/dashboard/approved-campaigns/${campaignId}/edit`)
              }
            >
              Edit
            </Button>

            <Button
              size="small"
              color="error"
              variant="outlined"
              className="!border-[#F04438] !text-[#F04438] hover:!bg-[#FEF3F2]"
              onClick={handleOpenDeleteModal}
            >
              Delete
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TotalRaisedCard
              totalRaised={campaignData.raised}
              campaignGoal={campaignData.goal}
              raisedChangePercent={raisedChangePercent}
            />

            <div className="grid grid-rows-2 gap-8">
              <TotalDonorsCard
                totalDonors={campaignData.donors}
                donorsChangePercent={donorsChangePercent}
              />

              <DaysRemainingCard
                startDate={competitionData?.start_date ?? null}
                endDate={competitionData?.end_date ?? null}
                is_current={!isPastCampaign}
              />
            </div>
          </div>
        </section>

        <section id="dashboard-donations" className="scroll-mt-20">
          <DonorsTable campaignId={campaignId} campaignName={campaignData.name} />
        </section>

        <section id="dashboard-analytics" className="scroll-mt-20">
          {txnsError || dates.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#e5e5e5] p-6 h-[360px] flex flex-col items-center justify-center text-center">
              <p className="font-medium text-black">No donations yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Once donations start rolling in, you&apos;ll see your earnings
                trend here.
              </p>
            </div>
          ) : (
            <EarningsTrendCard
              dates={dates}
              dailyValues={dailyValues}
              totalValues={totalValues}
              campaignGoal={campaignData.goal}
              todayIso={todayIso}
            />
          )}
        </section>
      </div>

      <BaseModal
        open={viewCampaignModal}
        onClose={() => setViewCampaignModal(false)}
        title="You are about to leave the site"
      >
        <p className="text-[#666666] !text-[16px]">
          The link you have clicked will open a new website in a separate tab.
          Would you like to proceed?
        </p>

        <div className="flex flex-row mt-5 w-full justify-end">
          <Button
            variant="outlined"
            size="small"
            className="mt-4 !border-none !text-[#666666]"
            onClick={() => setViewCampaignModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            size="small"
            className="mt-4 !ml-3"
            onClick={() => {
              if (!campaignData.givebutterlink) return;
              window.open(campaignData.givebutterlink, "_blank");
            }}
          >
            Proceed
          </Button>
        </div>
      </BaseModal>

      <BaseModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-[20px] font-semibold text-[#123A1E]">
            Confirm Deletion
          </h2>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(false)}
            className="text-[#666666] transition-colors hover:text-[#1f2320]"
            aria-label="Close delete dialog"
          >
            <Close />
          </button>
        </div>
        <p className="mb-8 text-gray-700">
          You are about to delete {campaignData.name} including all of its 
          donation records. This action is irreversible. Are you sure you 
          would like to delete this campaign?
        </p>
        {deleteError && (
          <p className="mb-4 text-sm text-red-600">{deleteError}</p>
        )}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="cursor-pointer px-4 py-2 font-medium text-gray-600 transition-colors hover:text-gray-800"
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={deleteUnlockIn > 0 || isDeleting}
            className={clsx(
              "rounded px-5 py-2 font-medium transition-colors",
              deleteUnlockIn > 0 || isDeleting
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "cursor-pointer bg-red-600 text-white hover:bg-red-700",
            )}
          >
            {isDeleting
              ? "DELETING..."
              : deleteUnlockIn > 0
                ? `DELETE (${deleteUnlockIn})`
                : "DELETE"}
          </button>
        </div>
      </BaseModal>

      <BaseModal
        open={isSuspendModalOpen}
        onClose={closeSuspendModal}
        title="Confirm Suspension"
      >
        <div className="px-4 pb-4 text-[16px] text-[#727873]">
          <p>
            You are about to suspend{" "}
            <span className="font-medium text-[#222622]">
              {campaignData.name || "this campaign"}
            </span>
            . Are you sure you would like to proceed?
          </p>
          {suspendError && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {suspendError}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-4 pb-4">
          <Button
            onClick={closeSuspendModal}
            variant="text"
            disabled={isSuspending}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleConfirmSuspend}
            variant="contained"
            size="small"
            disabled={isSuspending}
          >
            {isSuspending
              ? "SUSPENDING..."
              : "SUSPEND"}
          </Button>
        </div>
      </BaseModal>

      <BaseModal
        open={isUnsuspendModalOpen}
        onClose={closeUnsuspendModal}
        title="Unsuspend Campaign?"
        containerClassName="!min-h-0 !p-4"
        titleClassName="!mb-2"
      >
        <div className="px-2 pb-2 text-[16px] text-[#727873]">
          <p>
            <span className="font-medium text-[#222622]">
              {campaignData.name || "This campaign"}
            </span>{" "}
            will go back online with the status it had before (Published) and
            can receive donations again.
          </p>
          {unsuspendError && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {unsuspendError}
            </p>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-2 pb-1">
          <Button
            onClick={closeUnsuspendModal}
            variant="text"
            disabled={isUnsuspending}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleConfirmUnsuspend}
            variant="contained"
            size="small"
            disabled={isUnsuspending}
          >
            {isUnsuspending ? "UNSUSPENDING..." : "YES, UNSUSPEND"}
          </Button>
        </div>
      </BaseModal>

      <BaseAlert
        open={toast}
        onClose={() => setToast(false)}
        title="Link copied!"
        copySuccess
      >
        <p>Campaign link has been copied to clipboard</p>
      </BaseAlert>
    </div>
  );
}
