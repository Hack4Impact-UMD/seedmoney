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
import StartApplicationModal from "@/src/components/StartApplicationModal";
import Tooltip from "@mui/material/Tooltip";

export default function Navbar({ compact = false }: { compact?: boolean }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCampaignSheetOpen, setIsCampaignSheetOpen] = useState(false);
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsModal, setActiveSettingsModal] = useState<
    "name" | "email" | "password" | null
  >(null);
  const [savedName, setSavedName] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);
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
  const parsedFullName = useMemo(() => {
    const fullName = user?.user_metadata?.full_name;

    if (typeof fullName !== "string") {
      return { firstName: "", lastName: "" };
    }

    const parts = fullName.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      return { firstName: "", lastName: "" };
    }

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  }, [user?.user_metadata?.full_name]);

  const firstName =
    savedName?.firstName ??
    userData?.first_name ??
    parsedFullName.firstName;
  const lastName =
    savedName?.lastName ?? userData?.last_name ?? parsedFullName.lastName;
  const email = userData?.email ?? user?.email ?? "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ");
  const isGoogleAuth = user?.app_metadata?.provider === "google";
  const updateUser = useUpdateUser();

  const handleReauthenticate = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSettingsSave = async (
    nextFirstName: string,
    nextLastName: string,
  ) => {
    if (!userData?.id) {
      setNameSaveError("Unable to update name right now.");
      return false;
    }
    try {
      setNameSaveError(null);
      await updateUser.mutateAsync({
        userId: userData.id,
        userUpdateData: { first_name: nextFirstName, last_name: nextLastName },
      });
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
    const hasName =
      typeof campaign.name === "string" && campaign.name.trim() !== "";

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

  const renderMobileCampaignItem = (campaign: Campaign) => {
    const isSelected =
      !isViewAllSelected && campaign.campaign_id === selectedCampaignId;

    return (
      <button
        key={campaign.campaign_id}
        type="button"
        onClick={() => {
          setIsCampaignSheetOpen(false);
          handleCampaignClick(campaign.campaign_id);
        }}
        className={clsx(
          "flex w-full items-center px-8 py-6 text-left",
          isSelected ? "bg-[#123A1E]" : "bg-transparent",
        )}
      >
        <span className="text-[20px] font-bold leading-[1.334] text-white">
          {getCampaignDisplayName(campaign)}
        </span>
      </button>
    );
  };

  return (
    <>
      <nav
        className={clsx(
          "sticky top-0 z-20 hidden h-screen min-h-0 shrink-0 self-start flex-col overflow-visible bg-[#2D7A45] transition-[width] duration-300 ease-in-out md:flex",
          isCollapsed
            ? "!w-[96px]"
            : compact
              ? "!w-[260px]"
              : "!w-[300px] xl:!w-[300px]",
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
                "flex shrink-0 items-center justify-center rounded-full bg-white cursor-pointer",
                isCollapsed ? "h-11 w-11" : compact ? "h-14 w-14" : "h-16 w-16",
              )}
              onClick={() => router.push("/dashboard")}
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
                <p
                  className={clsx(
                    "text-white/80",
                    compact ? "text-[13px]" : "text-sm",
                  )}
                >
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
            "!absolute !right-0 !z-[60] !h-9 !w-9 !translate-x-1/2 !border-2 !border-[#2D7A45] !bg-white !text-[#2D7A45] !shadow-sm hover:!bg-gray-100",
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
                  label: "Approved Campaigns",
                  path: "/dashboard/approved-campaigns",
                },
                {
                  label: "Review Applications",
                  path: "/dashboard/review-applications",
                },
                {
                  label: "Previous Campaigns",
                  path: "/dashboard/previous-campaigns",
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
                <SettingsIcon
                  className={compact ? "!text-[24px]" : "!text-[28px]"}
                />
                {!isCollapsed && <span className="ml-2">SETTINGS</span>}
              </Button>
              <Button
                onClick={handleLogout}
                size="medium"
                variant="text"
                className="!flex !justify-start !text-white"
              >
                <LogoutIcon
                  className={compact ? "!text-[24px]" : "!text-[28px]"}
                />
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
              <Tooltip
                title={!currentCompetitionData?.is_application_open ? "Application is closed for this cycle" : ""}
                placement="top"
              >
                <span>
                  <Button
                    size={compact ? "medium" : "large"}
                    variant={currentCompetitionData?.is_application_open ? "outlined" : "contained"}
                    startIcon={!isCollapsed && <AddIcon />}
                    onClick={() => setOpenApplyModal(true)}
                    fullWidth
                    className="hover:!bg-gray-100"
                    disabled={!currentCompetitionData?.is_application_open}
                  >
                    {isCollapsed ? <AddIcon /> : "New Campaign"}
                  </Button>
                </span>
              </Tooltip>
              <Button
                onClick={handleSettings}
                size="medium"
                variant="text"
                className="!flex !justify-start !text-white"
              >
                <SettingsIcon
                  className={compact ? "!text-[24px]" : "!text-[28px]"}
                />
                {!isCollapsed && <span className="ml-2">SETTINGS</span>}
              </Button>
              <Button
                onClick={handleLogout}
                size="medium"
                variant="text"
                className="!flex !justify-start !text-white"
              >
                <LogoutIcon
                  className={compact ? "!text-[24px]" : "!text-[28px]"}
                />
                {!isCollapsed && <span className="ml-2">LOG OUT</span>}
              </Button>
            </div>
          </>
        )}

        <StartApplicationModal
          open={openApplyModal}
          onClose={() => setOpenApplyModal(false)}
          onStart={() => {
            setOpenApplyModal(false);
            router.push("/apply");
          }}
          startDate={currentCompetitionData?.start_date}
          endDate={currentCompetitionData?.end_date}
        />
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
        slotProps={{
          paper: {
            className: "!overflow-hidden !rounded-t-[24px] !bg-[#2D7A45]",
          },
        }}
      >
        <div className="flex min-h-[65dvh] max-h-[calc(100dvh-12px)] flex-col">
          <div className="flex items-start gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
              <Image
                src="/seedMoneyLogo.png"
                alt="SeedMoney"
                width={30}
                height={30}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[20px] font-bold leading-[1.334] text-white">
                {firstName ?? "SeedMoney"}
              </p>
              <p className="text-sm leading-6 text-white/70">
                {isAdmin ? "Admin" : "Campaign Leader"}
              </p>
            </div>
            <IconButton
              onClick={() => setIsCampaignSheetOpen(false)}
              className="!p-0 !text-white"
              aria-label="Close navigation"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {!isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsCampaignSheetOpen(false);
                    router.push("/dashboard/view-all");
                  }}
                  className={clsx(
                    "flex w-full items-center px-8 py-6 text-left",
                    isViewAllSelected ? "bg-[#123A1E]" : "bg-transparent",
                  )}
                >
                  <span className="text-[20px] font-bold leading-[1.334] text-white">
                    All Campaigns
                  </span>
                </button>
                {currentYearCampaigns.length > 0 && (
                  <>
                    <p className="px-6 pb-1 text-base leading-6 text-white/90">
                      {currentYear} Campaign
                    </p>
                    <div className="flex flex-col">
                      {currentYearCampaigns.map(renderMobileCampaignItem)}
                    </div>
                  </>
                )}
                {previousCampaigns.length > 0 && (
                  <>
                    <p className="px-6 pb-1 pt-3 text-base leading-6 text-white/70">
                      Previous Campaigns
                    </p>
                    <div className="flex flex-col">
                      {previousCampaigns.map(renderMobileCampaignItem)}
                    </div>
                  </>
                )}
              </>
            )}

            {isAdmin && (
              <List disablePadding>
                {[
                  { label: "Home", path: "/dashboard" },
                  {
                    label: "Approved Campaigns",
                    path: "/dashboard/approved-campaigns",
                  },
                  {
                    label: "Review Applications",
                    path: "/dashboard/review-applications",
                  },
                  {
                    label: "Previous Campaigns",
                    path: "/dashboard/previous-campaigns",
                  },
                  { label: "List of Users", path: "/dashboard/users" },
                ].map(({ label, path }) => {
                  const isSelected =
                    path === "/dashboard"
                      ? pathname === path
                      : pathname.startsWith(path);

                  return (
                    <button
                      key={path}
                      type="button"
                      onClick={() => {
                        setIsCampaignSheetOpen(false);
                        router.push(path);
                      }}
                      className={clsx(
                        "flex w-full items-center px-8 py-6 text-left",
                        isSelected ? "bg-[#123A1E]" : "bg-transparent",
                      )}
                    >
                      <span className="text-[20px] font-bold leading-[1.334] text-white">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </List>
            )}
          </div>

          <div className="shrink-0 px-6 pb-4 pt-4">
            {!isAdmin && (
              <Button
                type="button"
                fullWidth
                variant="contained"
                startIcon={<AddIcon className="!text-[24px]" />}
                onClick={() => {
                  setIsCampaignSheetOpen(false);
                  setOpenApplyModal(true);
                }}
                className="!mb-2 !justify-center !rounded-[8px] !bg-white !px-[26px] !py-3 !text-[20px] !font-bold !leading-[1.5] !text-[#123A1E] hover:!bg-[#f5f5f5]"
              >
                New Campaign
              </Button>
            )}

            <div className="flex items-start gap-2">
              <Button
                type="button"
                fullWidth
                variant="text"
                onClick={() => {
                  setIsCampaignSheetOpen(false);
                  setIsSettingsModalOpen(true);
                }}
                startIcon={<SettingsIcon className="!text-[20px]" />}
                className="!justify-start !rounded-[8px] !px-2 !py-[10px] !text-[16px] !font-bold !leading-[26px] !text-white"
              >
                Settings
              </Button>
              <Button
                type="button"
                fullWidth
                variant="text"
                onClick={handleLogout}
                startIcon={<LogoutIcon className="!text-[20px]" />}
                className="!justify-start !rounded-[8px] !px-2 !py-[10px] !text-[16px] !font-bold !leading-[26px] !text-white"
              >
                Log Out
              </Button>
            </div>
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
            {
              label: "Email",
              value: email || "—",
              key: "email" as const,
              hideForGoogle: true,
            },
            {
              label: "Password",
              value: "••••••••••••••••••",
              key: "password" as const,
              hideForGoogle: true,
            },
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
          onClose={() => {
            setNameSaveError(null);
            setActiveSettingsModal(null);
          }}
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
