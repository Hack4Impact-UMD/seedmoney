"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
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
import ChangeNameModal from "@/src/components/settings-modals/ChangeNameModal";
import ChangeEmailModal from "@/src/components/settings-modals/ChangeEmailModal";
import ChangePasswordModal from "@/src/components/settings-modals/ChangePasswordModal";
import useUpdateUser from "@/src/hooks/users/useUpdateUser";

export default function Navbar({ compact = false }: { compact?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCampaignSheetOpen, setIsCampaignSheetOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsModal, setActiveSettingsModal] = useState<"name" | "email" | "password" | null>(null);
  const [savedName, setSavedName] = useState<{ firstName: string; lastName: string } | null>(null);
  const [nameSaveError, setNameSaveError] = useState<string | null>(null);
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

  const firstName = savedName?.firstName ?? userData?.first_name ?? user?.user_metadata.full_name;
  const lastName = savedName?.lastName ?? userData?.last_name ?? "";
  const email = userData?.email ?? user?.email ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ");
  const isGoogleAuth = user?.app_metadata?.provider === "google";
  const updateUser = useUpdateUser();

  const handleReauthenticate = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSettingsSave = async (nextFirstName: string, nextLastName: string) => {
    if (!userData?.id) { setNameSaveError("Unable to update name right now."); return false; }
    try {
      setNameSaveError(null);
      await updateUser.mutateAsync({ userId: userData.id, userUpdateData: { first_name: nextFirstName, last_name: nextLastName } });
      setSavedName({ firstName: nextFirstName, lastName: nextLastName });
      setActiveSettingsModal(null);
      return true;
    } catch {
      setNameSaveError("Unable to update name. Try again.");
      return false;
    }
  };

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
    console.log("[Navbar] currentCompetitionId:", currentCompetitionId, typeof currentCompetitionId);
    campaigns.forEach(c => console.log("[Navbar] campaign:", c.name, "competition_id:", c.competition_id, typeof c.competition_id));
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
    <>
    <nav
      className={clsx(
        "!sticky !top-0 hidden md:flex h-screen min-h-0 flex-col shrink-0 overflow-visible bg-[#2D7A45] transition-[width] duration-300 ease-in-out",
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
                      primary="View all"
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
              onClick={() => router.push("/apply")}
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
    </nav>

      {/* Mobile FAB — floating hamburger button */}
      {userData && (
        <IconButton
          onClick={() => setIsCampaignSheetOpen(true)}
          className="!fixed !bottom-4 !right-4 !z-50 !bg-white !shadow-lg !border !border-[#2D7A45] md:!hidden"
          size="large"
          aria-label="Open navigation"
        >
          <MenuIcon className="!text-[#2D7A45]" />
        </IconButton>
      )}

      {/* Mobile bottom drawer */}
      <Drawer
        anchor="bottom"
        open={isCampaignSheetOpen}
        onClose={() => setIsCampaignSheetOpen(false)}
        className="md:hidden"
        slotProps={{ paper: { className: "!rounded-t-2xl !bg-[#2D7A45]" } }}
      >
        <div className="pt-4 pb-6">
          {/* User info */}
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
              <Image src="/seedMoneyLogo.png" alt="SeedMoney" width={28} height={28} />
            </div>
            <div>
              <p className="text-base font-bold text-white">{firstName ?? "SeedMoney"}</p>
              <p className="text-sm text-white/70">{isAdmin ? "Admin" : "Campaign Leader"}</p>
            </div>
          </div>

          {/* Campaign list — no horizontal padding so highlight spans full width */}
          {!isAdmin && (
            <>
              {currentYearCampaigns.length > 0 && (
                <>
                  <p className="px-4 text-xs text-white/70 mb-1">{currentYear} Campaign</p>
                  <div className="mx-4 border-t border-white/20 mb-2" />
                  <List disablePadding>
                    {currentYearCampaigns.map(renderCampaignItem)}
                  </List>
                </>
              )}
              {previousCampaigns.length > 0 && (
                <>
                  <p className="px-4 text-xs text-white/50 mt-3 mb-1">Previous Campaigns</p>
                  <div className="mx-4 border-t border-white/20 mb-2" />
                  <List disablePadding>
                    {previousCampaigns.map(renderCampaignItem)}
                  </List>
                </>
              )}
            </>
          )}

          {/* Actions */}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => { setIsCampaignSheetOpen(false); router.push("/apply"); }}
              className="mt-3 mx-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-md bg-white py-3 text-sm font-semibold text-[#2D7A45] hover:bg-gray-50"
            >
              <AddIcon className="!text-[18px]" />
              NEW CAMPAIGN
            </button>
          )}
          <div className="mt-2 px-4 flex">
            <button
              type="button"
              onClick={() => { setIsCampaignSheetOpen(false); setIsSettingsModalOpen(true); }}
              className="flex flex-1 items-center gap-2 py-2 text-sm font-medium text-white hover:text-white/80"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.9987 12.5002C11.3794 12.5002 12.4987 11.3809 12.4987 10.0002C12.4987 8.61945 11.3794 7.50016 9.9987 7.50016C8.61799 7.50016 7.4987 8.61945 7.4987 10.0002C7.4987 11.3809 8.61799 12.5002 9.9987 12.5002Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.1654 12.5002C16.0544 12.7515 16.0213 13.0303 16.0704 13.3007C16.1194 13.571 16.2483 13.8204 16.4404 14.0168L16.4904 14.0668C16.6453 14.2216 16.7683 14.4054 16.8521 14.6078C16.936 14.8101 16.9792 15.027 16.9792 15.246C16.9792 15.465 16.936 15.6819 16.8521 15.8842C16.7683 16.0866 16.6453 16.2704 16.4904 16.4252C16.3356 16.5801 16.1518 16.7031 15.9494 16.7869C15.7471 16.8708 15.5302 16.914 15.3112 16.914C15.0922 16.914 14.8753 16.8708 14.673 16.7869C14.4706 16.7031 14.2868 16.5801 14.132 16.4252L14.082 16.3752C13.8856 16.183 13.6362 16.0542 13.3659 16.0052C13.0955 15.9561 12.8167 15.9892 12.5654 16.1002C12.3189 16.2058 12.1087 16.3812 11.9606 16.6048C11.8126 16.8284 11.7331 17.0903 11.732 17.3585V17.5002C11.732 17.9422 11.5564 18.3661 11.2439 18.6787C10.9313 18.9912 10.5074 19.1668 10.0654 19.1668C9.62334 19.1668 9.19941 18.9912 8.88685 18.6787C8.57429 18.3661 8.3987 17.9422 8.3987 17.5002V17.4252C8.39225 17.1493 8.30296 16.8818 8.14246 16.6574C7.98195 16.433 7.75764 16.2621 7.4987 16.1668C7.24735 16.0559 6.96854 16.0228 6.69821 16.0718C6.42788 16.1208 6.17843 16.2497 5.98203 16.4418L5.93203 16.4918C5.77724 16.6468 5.59343 16.7697 5.3911 16.8536C5.18877 16.9375 4.97189 16.9806 4.75286 16.9806C4.53384 16.9806 4.31696 16.9375 4.11463 16.8536C3.9123 16.7697 3.72849 16.6468 3.5737 16.4918C3.41874 16.337 3.29581 16.1532 3.21193 15.9509C3.12806 15.7486 3.08489 15.5317 3.08489 15.3127C3.08489 15.0936 3.12806 14.8768 3.21193 14.6744C3.29581 14.4721 3.41874 14.2883 3.5737 14.1335L3.6237 14.0835C3.81581 13.8871 3.94469 13.6376 3.9937 13.3673C4.04272 13.097 4.00963 12.8182 3.8987 12.5668C3.79306 12.3204 3.61766 12.1101 3.39409 11.9621C3.17051 11.814 2.90852 11.7346 2.64036 11.7335H2.4987C2.05667 11.7335 1.63275 11.5579 1.32019 11.2453C1.00763 10.9328 0.832031 10.5089 0.832031 10.0668C0.832031 9.6248 1.00763 9.20088 1.32019 8.88832C1.63275 8.57576 2.05667 8.40016 2.4987 8.40016H2.5737C2.84953 8.39371 3.11704 8.30443 3.34145 8.14392C3.56586 7.98342 3.73679 7.75911 3.83203 7.50016C3.94296 7.24882 3.97605 6.97 3.92704 6.69967C3.87802 6.42934 3.74915 6.1799 3.55703 5.9835L3.50703 5.9335C3.35207 5.77871 3.22914 5.59489 3.14527 5.39256C3.06139 5.19023 3.01822 4.97336 3.01822 4.75433C3.01822 4.5353 3.06139 4.31843 3.14527 4.1161C3.22914 3.91377 3.35207 3.72995 3.50703 3.57516C3.66182 3.4202 3.84563 3.29727 4.04796 3.2134C4.25029 3.12952 4.46717 3.08635 4.6862 3.08635C4.90522 3.08635 5.1221 3.12952 5.32443 3.2134C5.52676 3.29727 5.71058 3.4202 5.86536 3.57516L5.91536 3.62516C6.11176 3.81728 6.36121 3.94615 6.63154 3.99517C6.90187 4.04418 7.18068 4.01109 7.43203 3.90016H7.4987C7.74517 3.79453 7.95538 3.61913 8.10344 3.39555C8.25151 3.17198 8.33096 2.90998 8.33203 2.64183V2.50016C8.33203 2.05814 8.50763 1.63421 8.82019 1.32165C9.13275 1.00909 9.55667 0.833496 9.9987 0.833496C10.4407 0.833496 10.8646 1.00909 11.1772 1.32165C11.4898 1.63421 11.6654 2.05814 11.6654 2.50016V2.57516C11.6664 2.84332 11.7459 3.10531 11.894 3.32888C12.042 3.55246 12.2522 3.72786 12.4987 3.8335C12.75 3.94443 13.0289 3.97752 13.2992 3.9285C13.5695 3.87948 13.819 3.75061 14.0154 3.5585L14.0654 3.5085C14.2202 3.35354 14.404 3.2306 14.6063 3.14673C14.8086 3.06286 15.0255 3.01969 15.2445 3.01969C15.4636 3.01969 15.6804 3.06286 15.8828 3.14673C16.0851 3.2306 16.2689 3.35354 16.4237 3.5085C16.5787 3.66328 16.7016 3.8471 16.7855 4.04943C16.8693 4.25176 16.9125 4.46864 16.9125 4.68766C16.9125 4.90669 16.8693 5.12357 16.7855 5.3259C16.7016 5.52823 16.5787 5.71204 16.4237 5.86683L16.3737 5.91683C16.1816 6.11323 16.0527 6.36268 16.0037 6.63301C15.9547 6.90333 15.9878 7.18215 16.0987 7.4335V7.50016C16.2043 7.74664 16.3797 7.95684 16.6033 8.10491C16.8269 8.25297 17.0889 8.33243 17.357 8.3335H17.4987C17.9407 8.3335 18.3646 8.50909 18.6772 8.82165C18.9898 9.13421 19.1654 9.55814 19.1654 10.0002C19.1654 10.4422 18.9898 10.8661 18.6772 11.1787C18.3646 11.4912 17.9407 11.6668 17.4987 11.6668H17.4237C17.1555 11.6679 16.8936 11.7474 16.67 11.8954C16.4464 12.0435 16.271 12.2537 16.1654 12.5002Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              SETTINGS
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-1 items-center gap-2 py-2 text-sm font-medium text-white hover:text-white/80"
            >
              <LogoutIcon className="!text-[18px]" />
              LOG OUT
            </button>
          </div>
        </div>
      </Drawer>

      {/* Settings modal */}
      <BaseModal
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Settings"
        containerClassName="!w-[90vw] !max-w-sm"
      >
        <div className="divide-y divide-gray-100">
          {[
            { label: "Name", value: displayName || "—", key: "name" as const },
            { label: "Email", value: email || "—", key: "email" as const, hideForGoogle: true },
            { label: "Password", value: "••••••••••••••••••", key: "password" as const, hideForGoogle: true },
          ].map(({ label, value, key, hideForGoogle }) => (
            <div key={key} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-[#1f2320]">{label}</p>
                <p className="text-sm text-[#7b827d]">{value}</p>
              </div>
              {(!hideForGoogle || !isGoogleAuth) && (
                <button
                  type="button"
                  onClick={() => setActiveSettingsModal(key)}
                  className="rounded-lg border border-[#2D7A45] px-3 py-1 text-xs font-semibold text-[#2D7A45] hover:bg-[#f3faf4]"
                >
                  EDIT
                </button>
              )}
            </div>
          ))}
        </div>
      </BaseModal>

      {activeSettingsModal === "name" && (
        <ChangeNameModal
          open
          onClose={() => { setNameSaveError(null); setActiveSettingsModal(null); }}
          firstName={firstName ?? ""}
          lastName={lastName}
          title={isGoogleAuth ? "Confirm Edit" : "Change Name"}
          onSave={handleSettingsSave}
          saveError={nameSaveError}
          isSaving={updateUser.isPending}
        />
      )}
      {activeSettingsModal === "email" && (
        <ChangeEmailModal
          open
          onClose={() => setActiveSettingsModal(null)}
          userEmail={email}
          onLogin={handleReauthenticate}
        />
      )}
      {activeSettingsModal === "password" && (
        <ChangePasswordModal
          open
          onClose={() => setActiveSettingsModal(null)}
          userEmail={email}
          onLogin={handleReauthenticate}
        />
      )}
    </>
  );
}
