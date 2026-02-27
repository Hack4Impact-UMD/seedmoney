"use client";

import { useState } from "react";
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
import Image from "next/image";

type SidebarProps = {
  campaigns: Array<{ id: string; name: string }>;
  selectedCampaignId: string;
  onCampaignSelect: (id: string) => void;
};

export default function Navbar({
  campaigns,
  selectedCampaignId,
  onCampaignSelect,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCampaignClick = (id: string) => {
    onCampaignSelect(id);
    console.log(`Navigate -> /campaigns/${id}`);
  };

  const handleNewCampaign = () => console.log("Navigate -> /campaigns/new");
  const handleLogout = () => console.log("Navigate -> /logout");

  return (
    <nav
      className={clsx(
        "relative flex flex-col h-screen bg-[#00A63E] shrink-0 overflow-visible transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-[105px]" : "w-[280px]! xl:w-[360px]"
      )}
    >
      {/* Profile */}
      <div className="flex items-center px-5 pt-6 pb-4">
        <div
          className={clsx(
            "flex items-center gap-4 min-w-0 flex-1",
            isCollapsed && "justify-center"
          )}
        >
          <div
            className={clsx(
              "shrink-0 rounded-full bg-white flex items-center justify-center",
              isCollapsed ? "w-12 h-12" : "w-16 h-16"
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
              <h6 className="text-white font-bold leading-[1.3] text-xl">John Doe</h6>
              <p className="text-white/80 text-sm">Campaign Leader</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <IconButton
        onClick={() => setIsCollapsed((prev) => !prev)}
        size="small"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="!absolute !top-[100px] !right-0 !translate-x-1/2 !z-50 !border-2 !border-[#00A63E] !text-[#00A63E] !bg-white !w-9 !h-9 hover:!bg-gray-100"
      >
        {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </IconButton>

      {/* Campaign List */}
      <div className="flex-1 flex flex-col overflow-y-auto mt-5">
        <div className="h-7 text-white px-6 mb-2 tracking-[1px] text-[16px] font-normal">
          {!isCollapsed && "Your Campaigns"}
        </div>

        <List disablePadding>
          {campaigns.map((campaign) => {
            const isSelected = campaign.id === selectedCampaignId;

            return (
              <ListItemButton
                key={campaign.id}
                onClick={() => handleCampaignClick(campaign.id)}
                aria-label={campaign.name}
                className={clsx(
                  "!p-0 !min-h-12",
                  isSelected
                    ? "!bg-[#008030] hover:!bg-black/30"
                    : "!bg-transparent hover:!bg-[#43B45D]",
                  isCollapsed ? "!justify-center !px-0" : "!justify-start"
                )}
              >
                {isCollapsed ? (
                  <div
                    className={clsx(
                      "w-3 h-3 rounded-full",
                      isSelected ? "bg-white" : "bg-gray-200/50"
                    )}
                  />
                ) : (
                  <ListItemText
                    primary={campaign.name}
                    slotProps={{
                      primary: {
                        className: "!text-white !font-[700] !text-[24px] !px-[48px] !py-[32px] !leading-[32px]",
                      },
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </div>

      {/* Bottom Actions */}
      <div className="px-4 pb-6 flex flex-col gap-3">
        <Button
          size="large"
          variant="outlined"
          startIcon={!isCollapsed && <AddIcon />}
          onClick={handleNewCampaign}
          fullWidth
          className = "hover:!bg-gray-100"
        >
          {isCollapsed ? <AddIcon /> : "New Campaign"}
        </Button>

        <Button
          onClick={handleLogout}
          size="medium"
          variant="text"
          aria-label="Logout"
          className = "!flex !justify-start !text-white"

        >
          <LogoutIcon className="!text-[28px]" />
          {!isCollapsed && <span className="ml-2">LOG OUT</span>}
        </Button>
      </div>
    </nav>
  );
}