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

export default function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { data: userData } = useUserByAuthId(user?.id || "");
  const { data: campaigns = [], isLoading } = useReadCampaignsFromMembers(user?.id || "");
  const { data: currentCompetitionData} = useReadCurrentCompetition();

  const router = useRouter();
  const pathname = usePathname();
  const { campaignId } = useParams<{ campaignId: string }>();

  const selectedCampaignId = Number(campaignId);
  const isAdmin = userData?.is_admin ?? false;

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

  const { currentYearCampaigns, previousCampaigns } = useMemo(() => {
    const currentYearCampaigns = campaigns
      .filter(
        (campaign) =>
          campaign.competition_id === currentCompetitionData?.competition_id
      )
      .sort(
        (a, b) =>
          moment(b.date_created, "YYYY-MM-DD").valueOf() -
          moment(a.date_created, "YYYY-MM-DD").valueOf(),
      );

    const previousCampaigns = campaigns
      .filter(
        (campaign) =>
          campaign.competition_id !== currentCompetitionData?.competition_id
      )
      .sort(
        (a, b) =>
          moment(b.date_created, "YYYY-MM-DD").valueOf() -
          moment(a.date_created, "YYYY-MM-DD").valueOf(),
      );

    return { currentYearCampaigns, previousCampaigns };
  }, [campaigns, currentYear, currentCompetitionData?.competition_id]);

  const getItemClasses = (isSelected: boolean) =>
    clsx(
      "!p-0 !min-h-12",
      isSelected ? "!bg-[#1A4A28] hover:!bg-black/30" : "!bg-transparent hover:!bg-[#43B45D]",
      isCollapsed ? "!justify-center !px-0" : "!justify-start",
    );

  const renderCampaignItem = (campaign: Campaign) => {
    const isSelected = !isViewAllSelected && campaign.campaign_id === selectedCampaignId;
    return (
      <ListItemButton
        key={campaign.campaign_id}
        onClick={() => handleCampaignClick(campaign.campaign_id)}
        className={getItemClasses(isSelected)}
      >
        {isCollapsed ? (
          <div className={clsx("h-3 w-3 rounded-full", isSelected ? "bg-white" : "bg-gray-200/50")} />
        ) : (
          <ListItemText
            primary={
              `${campaign.name}${
                campaign.status === "in_progress" ? " (Draft)" 
                : campaign.status === "submitted_under_review" ? " (Pending)"
                : ""
              }`
            }
            slotProps={{
              primary: {
                className: "!px-[48px] !py-[20px] !text-[16px] !font-[600] !leading-[24px] !text-white",
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
        "sticky! top-0! flex h-screen flex-col shrink-0 overflow-visible bg-[#2D7A45] transition-[width] duration-300 ease-in-out",
        isCollapsed ? "!w-[105px]" : "!w-[300px] xl:!w-[300px]",
      )}
    >
      <div className="flex items-center px-5 pb-4 pt-6">
        <div className={clsx("flex min-w-0 flex-1 items-center gap-4", isCollapsed && "justify-center")}>
          <div
            className={clsx(
              "flex shrink-0 items-center justify-center rounded-full bg-white",
              isCollapsed ? "h-12 w-12" : "h-16 w-16",
            )}
          >
            <Image
              src="/seedMoneyLogo.png"
              alt="SeedMoney"
              width={isCollapsed ? 32 : 44}
              height={isCollapsed ? 32 : 44}
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h6 className="text-xl font-bold leading-[1.3] text-white">
                {userData?.first_name ?? "SeedMoney"}
              </h6>
              <p className="text-sm text-white/80">
                {isLoading ? "Loading..." : userData ? (isAdmin ? "Admin" : "Campaign Leader") : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <IconButton
        onClick={() => setIsCollapsed((prev) => !prev)}
        size="small"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="!absolute !right-0 !top-[100px] !z-50 !h-9 !w-9 !translate-x-1/2 !border-2 !border-[#2D7A45] !bg-white !text-[#2D7A45] hover:!bg-gray-100"
      >
        {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </IconButton>

      {userData && isAdmin && (
        <div className="scrollbar-hide mt-5 flex flex-1 flex-col overflow-y-auto overscroll-contain">
          <List disablePadding>
            {[
              { label: "Home", path: "/dashboard" },
              { label: "Ongoing Campaigns", path: "/dashboard/ongoing-campaigns" },
              { label: "Review Applications", path: "/dashboard/review-applications" },
              { label: "List of Users", path: "/dashboard/users" },
            ].map(({ label, path }) => {
              const isSelected = path === "/dashboard" ? pathname === path : pathname.startsWith(path);
              return (
                <ListItemButton key={path} onClick={() => router.push(path)} className={getItemClasses(isSelected)}>
                  {isCollapsed ? (
                    <div className={clsx("h-3 w-3 rounded-full", isSelected ? "bg-white" : "bg-gray-200/50")} />
                  ) : (
                    <ListItemText
                      primary={label}
                      slotProps={{
                        primary: {
                          className: "!px-[48px] !py-[20px] !text-[16px] !font-[600] !leading-[24px] !text-white",
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </List>
          <div className="mt-auto flex flex-col gap-3 px-4 pb-6">
            <Button onClick={() => console.log("settings")} size="medium" variant="text" className="!flex !justify-start !text-white">
              <SettingsIcon className="!text-[28px]" />
              {!isCollapsed && <span className="ml-2">SETTINGS</span>}
            </Button>
            <Button onClick={handleLogout} size="medium" variant="text" className="!flex !justify-start !text-white">
              <LogoutIcon className="!text-[28px]" />
              {!isCollapsed && <span className="ml-2">LOG OUT</span>}
            </Button>
          </div>
        </div>
      )}

      {userData && !isAdmin && (
        <>
          <div className="scrollbar-hide mt-5 flex flex-1 flex-col overflow-y-auto overscroll-contain">
            {currentYearCampaigns.length > 0 && (
              <>
                {!isCollapsed && (
                  <div className="mb-2 h-7 px-6 text-[13px] font-normal tracking-[1px] text-white">
                    {currentYear} Campaigns
                  </div>
                )}
                <List disablePadding>{currentYearCampaigns.map(renderCampaignItem)}</List>
              </>
            )}

            {previousCampaigns.length > 0 && (
              <>
                {!isCollapsed && (
                  <div className="mb-2 mt-4 h-7 px-6 text-[13px] font-normal tracking-[1px] text-white/70">
                    Previous Campaigns
                  </div>
                )}
                <List disablePadding>{previousCampaigns.map(renderCampaignItem)}</List>
              </>
            )}

            <List disablePadding>
              <ListItemButton
                onClick={() => router.push("/dashboard/view-all")}
                className={clsx(getItemClasses(isViewAllSelected), "mt-2")}
              >
                {isCollapsed ? (
                  <div className={clsx("h-3 w-3 rounded-full", isViewAllSelected ? "bg-white" : "bg-gray-200/50")} />
                ) : (
                  <ListItemText
                    primary="View all"
                    slotProps={{
                      primary: {
                        className: "!px-[48px] !py-[20px] !text-[16px] !font-[600] !leading-[24px] !text-white",
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </List>
          </div>

          <div className="flex flex-col gap-3 px-4 pb-6">
            <Button size="large" variant="outlined" startIcon={!isCollapsed && <AddIcon />} onClick={() => console.log("new campaign")} fullWidth className="hover:!bg-gray-100">
              {isCollapsed ? <AddIcon /> : "New Campaign"}
            </Button>
            <Button onClick={() => console.log("settings")} size="medium" variant="text" className="!flex !justify-start !text-white">
              <SettingsIcon className="!text-[28px]" />
              {!isCollapsed && <span className="ml-2">SETTINGS</span>}
            </Button>
            <Button onClick={handleLogout} size="medium" variant="text" className="!flex !justify-start !text-white">
              <LogoutIcon className="!text-[28px]" />
              {!isCollapsed && <span className="ml-2">LOG OUT</span>}
            </Button>
          </div>
        </>
      )}
    </nav>
  );
}