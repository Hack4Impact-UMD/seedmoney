"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import Image from "next/image";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { usePathname, useRouter, useParams } from "next/navigation";
import moment from "moment";
import type { Campaign } from "@/src/types/db/campaigns";
import { useAuth } from "@/src/context/AuthProvider";
import useUserByAuthId from "@/src/hooks/users/useUserByAuthId";
import useReadCampaignsFromMembers from "@/src/hooks/campaign-members/useReadCampaignsFromMembers";
import useReadCurrentCompetition from "../hooks/competition-metadata/useReadCurrentCompetition";
import BaseModal from "@/src/components/bases/BaseModal";
import Logout from "@mui/icons-material/Logout";

export default function Navbar({ compact = false }: { compact?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const { user } = useAuth();
  const { data: userData } = useUserByAuthId(user?.id || "");
  const { data: campaigns = [], isLoading } = useReadCampaignsFromMembers(
    user?.id || "",
  );
  const { data: currentCompetitionData } = useReadCurrentCompetition();

  const router = useRouter();
  const pathname = usePathname();
  const { campaignId } = useParams<{ campaignId: string }>();

  const selectedCampaignId = Number(campaignId);
  const isAdmin = userData?.is_admin ?? false;

  const firstName = userData?.first_name ?? user?.user_metadata.full_name;

  const handleCampaignClick = (id: number) => {
    router.push(`/dashboard/${id}`);
  };

  const handleLogout = () => {
    const supabase = createBrowserClient();
    supabase.auth.signOut();
    router.push("/");
  };

  const handleSettings = () => {
    router.push("/dashboard/settings");
  };

  const currentYear = moment(currentCompetitionData?.start_date).format("YYYY");
  const isViewAllSelected = pathname === "/dashboard/view-all";
  const currentCompetitionId = currentCompetitionData?.competition_id;

  const { currentYearCampaigns, previousCampaigns } = useMemo(() => {
    const currentYearCampaigns = campaigns
      .filter((campaign) => campaign.competition_id === currentCompetitionId)
      .sort(
        (a, b) =>
          moment(b.date_created, "YYYY-MM-DD").valueOf() -
          moment(a.date_created, "YYYY-MM-DD").valueOf(),
      );

    const previousCampaigns = campaigns
      .filter((campaign) => campaign.competition_id !== currentCompetitionId)
      .sort(
        (a, b) =>
          moment(b.date_created, "YYYY-MM-DD").valueOf() -
          moment(a.date_created, "YYYY-MM-DD").valueOf(),
      );

    return { currentYearCampaigns, previousCampaigns };
  }, [campaigns, currentCompetitionId]);

  const getItemClasses = (isSelected: boolean) =>
    clsx(
      "!p-0",
      compact ? "!min-h-10" : "!min-h-12",
      isSelected
        ? "!bg-[#1A4A28] hover:!bg-black/30"
        : "!bg-transparent hover:!bg-[#43B45D]",
      isCollapsed ? "!justify-center !px-0" : "!justify-start",
    );

  const navItemTextClass = compact
    ? "!px-[36px] !py-[16px] !text-[15px] !font-[600] !leading-[22px] !text-white"
    : "!px-[48px] !py-[20px] !text-[16px] !font-[600] !leading-[24px] !text-white";

  const sectionHeadingClass = compact
    ? "mb-1 h-6 px-5 text-[12px] font-normal tracking-[0.08em] text-white"
    : "mb-2 h-7 px-6 text-[13px] font-normal tracking-[1px] text-white";

  const previousSectionHeadingClass = compact
    ? "mb-1 mt-3 h-6 px-5 text-[12px] font-normal tracking-[0.08em] text-white/70"
    : "mb-2 mt-4 h-7 px-6 text-[13px] font-normal tracking-[1px] text-white/70";

  const getCampaignDisplayName = (campaign: Campaign) => {
    const hasName = typeof campaign.name === "string" && campaign.name.trim() !== "";

    if (campaign.status === "in_progress") {
      return hasName ? `${campaign.name} (Draft)` : "Untitled Draft";
    }

    if (campaign.status === "pending") {
      return hasName
        ? `${campaign.name} (Pending)`
        : "Untitled Campaign (Pending)";
    }

    if (campaign.status === "denied") {
      return hasName
        ? `${campaign.name} (Denied)`
        : "Untitled Campaign (Denied)";
    }

    return hasName ? campaign.name : "Untitled Campaign";
  };

  const renderCampaignItem = (campaign: Campaign) => {
    const isSelected =
      !isViewAllSelected && campaign.campaign_id === selectedCampaignId;
    return (
      <ListItemButton
        key={campaign.campaign_id}
        onClick={() => handleCampaignClick(campaign.campaign_id)}
        className={getItemClasses(isSelected)}
      >
        {isCollapsed ? (
          <div
            className={clsx(
              "h-3 w-3 rounded-full",
              isSelected ? "bg-white" : "bg-gray-200/50",
            )}
          />
        ) : (
          <ListItemText
            primary={getCampaignDisplayName(campaign)}
            slotProps={{
              primary: {
                className: navItemTextClass,
              },
            }}
          />
        )}
      </ListItemButton>
    );
  };

  return (
    <nav
      className={clsx(
        "!sticky !top-0 flex h-screen min-h-0 flex-col shrink-0 overflow-visible bg-[#2D7A45] transition-[width] duration-300 ease-in-out",
        isCollapsed ? "!w-[96px]" : compact ? "!w-[260px]" : "!w-[300px] xl:!w-[300px]",
      )}
    >
      <div
        className={clsx(
          "flex items-center",
          compact ? "px-4 pb-3 pt-5" : "px-5 pb-4 pt-6",
        )}
      >
        <div
          className={clsx(
            "flex min-w-0 flex-1 items-center gap-4",
            isCollapsed && "justify-center",
          )}
        >
          <div
            className={clsx(
              "flex shrink-0 items-center justify-center rounded-full bg-white",
              isCollapsed ? "h-11 w-11" : compact ? "h-14 w-14" : "h-16 w-16",
            )}
          >
            <Image
              src="/seedMoneyLogo.png"
              alt="SeedMoney"
              width={isCollapsed ? 28 : compact ? 38 : 44}
              height={isCollapsed ? 28 : compact ? 38 : 44}
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h6
                className={clsx(
                  "font-bold leading-[1.3] text-white",
                  compact ? "text-lg" : "text-xl",
                )}
              >
                {firstName ?? "SeedMoney"}
              </h6>
              <p className={clsx("text-white/80", compact ? "text-[13px]" : "text-sm")}>
                {isLoading
                  ? "Loading..."
                  : userData
                    ? isAdmin
                      ? "Admin"
                      : "Campaign Leader"
                    : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <IconButton
        onClick={() => setIsCollapsed((prev) => !prev)}
        size="small"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={clsx(
          "!absolute !right-0 !z-50 !h-9 !w-9 !translate-x-1/2 !border-2 !border-[#2D7A45] !bg-white !text-[#2D7A45] hover:!bg-gray-100",
          compact ? "!top-[84px]" : "!top-[100px]",
        )}
      >
        {isCollapsed ? (
          <ChevronRightIcon fontSize="small" />
        ) : (
          <ChevronLeftIcon fontSize="small" />
        )}
      </IconButton>

      {userData && isAdmin && (
        <div className="scrollbar-hide mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <List disablePadding>
            {[
              { label: "Home", path: "/dashboard" },
              {
                label: "Ongoing Campaigns",
                path: "/dashboard/ongoing-campaigns",
              },
              {
                label: "Review Applications",
                path: "/dashboard/review-applications",
              },
              { label: "List of Users", path: "/dashboard/users" },
            ].map(({ label, path }) => {
              const isSelected =
                path === "/dashboard"
                  ? pathname === path
                  : pathname.startsWith(path);
              return (
                <ListItemButton
                  key={path}
                  onClick={() => router.push(path)}
                  className={getItemClasses(isSelected)}
                >
                  {isCollapsed ? (
                    <div
                      className={clsx(
                        "h-3 w-3 rounded-full",
                        isSelected ? "bg-white" : "bg-gray-200/50",
                      )}
                    />
                  ) : (
                    <ListItemText
                      primary={label}
                      slotProps={{
                        primary: {
                          className: navItemTextClass,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </List>
          <div
            className={clsx(
              "mt-auto shrink-0 flex flex-col",
              compact ? "gap-2 px-3 pb-4" : "gap-3 px-4 pb-6",
            )}
          >
            <Button
              onClick={handleSettings}
              size="medium"
              variant="text"
              className="!flex !justify-start !text-white"
            >
              <SettingsIcon className={compact ? "!text-[24px]" : "!text-[28px]"} />
              {!isCollapsed && <span className="ml-2">SETTINGS</span>}
            </Button>
            <Button
              onClick={handleLogout}
              size="medium"
              variant="text"
              className="!flex !justify-start !text-white"
            >
              <LogoutIcon className={compact ? "!text-[24px]" : "!text-[28px]"} />
              {!isCollapsed && <span className="ml-2">LOG OUT</span>}
            </Button>
          </div>
        </div>
      )}

      {userData && !isAdmin && (
        <>
          <div className="scrollbar-hide mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
            {currentYearCampaigns.length > 0 && (
              <>
                {!isCollapsed && (
                  <div className={sectionHeadingClass}>
                    {currentYear} Campaigns
                  </div>
                )}
                <List disablePadding>
                  {currentYearCampaigns.map(renderCampaignItem)}
                </List>
              </>
            )}

            {previousCampaigns.length > 0 && (
              <>
                {!isCollapsed && (
                  <div className={previousSectionHeadingClass}>
                    Previous Campaigns
                  </div>
                )}
                <List disablePadding>
                  {previousCampaigns.map(renderCampaignItem)}
                </List>
              </>
            )}

            <List disablePadding>
              <ListItemButton
                onClick={() => router.push("/dashboard/view-all")}
                className={clsx(getItemClasses(isViewAllSelected), "mt-2")}
              >
                {isCollapsed ? (
                  <div
                    className={clsx(
                      "h-3 w-3 rounded-full",
                      isViewAllSelected ? "bg-white" : "bg-gray-200/50",
                    )}
                  />
                ) : (
                  <ListItemText
                    primary="All Campaigns"
                    slotProps={{
                      primary: {
                        className: navItemTextClass,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </List>
          </div>

          <div
            className={clsx(
              "shrink-0 flex flex-col",
              compact ? "gap-2 px-3 pb-4" : "gap-3 px-4 pb-6",
            )}
          >
            <Button
              size={compact ? "medium" : "large"}
              variant="outlined"
              startIcon={!isCollapsed && <AddIcon />}
              onClick={() => setOpenApplyModal(true)}
              fullWidth
              className="hover:!bg-gray-100"
            >
              {isCollapsed ? <AddIcon /> : "New Campaign"}
            </Button>
            <Button
              onClick={handleSettings}
              size="medium"
              variant="text"
              className="!flex !justify-start !text-white"
            >
              <SettingsIcon className={compact ? "!text-[24px]" : "!text-[28px]"} />
              {!isCollapsed && <span className="ml-2">SETTINGS</span>}
            </Button>
            <Button
              onClick={handleLogout}
              size="medium"
              variant="text"
              className="!flex !justify-start !text-white"
            >
              <LogoutIcon className={compact ? "!text-[24px]" : "!text-[28px]"} />
              {!isCollapsed && <span className="ml-2">LOG OUT</span>}
            </Button>
          </div>
        </>
      )}

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
            By completing this application, you are applying to participate in
            the SeedMoney Challenge and to run a 30-day online fundraising
            campaign supported by SeedMoney running from{" "}
            {moment(currentCompetitionData?.start_date).format("MM/DD/YYYY")}–
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
            onClick={() => {
              setOpenApplyModal(false);
              router.push("/apply");
            }}
            endIcon={<Logout />}
          >
            Start Application
          </Button>
          
        </div>

      </BaseModal>
    </nav>
  );
}