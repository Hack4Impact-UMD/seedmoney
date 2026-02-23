import { useState } from "react";
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
import logo from "@/src/public/seedMoneyLogo.png";

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
    // TODO: implement campaign click logic
    onCampaignSelect(id);
    console.log(`Navigate -> /campaigns/${id}`);
  };

  const handleNewCampaign = () => {
    // TODO: implement new campaign logic
    console.log("Navigate -> /campaigns/new");
  };

  const handleLogout = () => {
    // TODO: implement logout logic
    console.log("Navigate -> /logout");
  };

  return (
    <nav
      className={`relative flex flex-col h-screen bg-[#00A63E] shrink-0 overflow-visible [transition:width_0.3s_ease] ${
        isCollapsed ? "w-[105px]" : "w-[438px]"
      }`}
    >
      <div className="flex items-center px-5 pt-6 pb-4">
        <div
          className={`flex items-center gap-4 min-w-0 flex-1 ${isCollapsed && "justify-center"}`}
        >
          <div
            className={`shrink-0 rounded-full bg-white flex items-center justify-center ${
              isCollapsed ? "w-12 h-12" : "w-16 h-16"
            }`}
          >
            <Image
              src={logo}
              alt="SeedMoney"
              width={isCollapsed ? 32 : 44}
              height={isCollapsed ? 32 : 44}
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h6 className="text-white font-bold leading-[1.3] text-xl">
                John Doe
              </h6>
              <p className="text-white/80 text-sm">Campaign Leader</p>
            </div>
          )}
        </div>
      </div>

      <IconButton
        onClick={() => setIsCollapsed((prev) => !prev)}
        size="small"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="!absolute !top-[75px] !right-0 !translate-x-1/2 !z-50 !border-2 !border-[`#00A63E`] !text-[`#00A63E`] !bg-white !w-9 !h-9 hover:!bg-gray-100"
      >
        {isCollapsed ? (
          <ChevronRightIcon fontSize="small" />
        ) : (
          <ChevronLeftIcon fontSize="small" />
        )}
      </IconButton>

      <div className="flex-1 flex flex-col overflow-y-auto mt-5">
        <div className="h-7 text-white tracking-[2px] px-6 mb-2 text-[0.8rem] uppercase">
          {!isCollapsed && "YOUR CAMPAIGNS"}
        </div>

        <List disablePadding>
          {campaigns.map((campaign) => {
            const isSelected = campaign.id === selectedCampaignId;

            return (
              <ListItemButton
                key={campaign.id}
                onClick={() => handleCampaignClick(campaign.id)}
                aria-label={campaign.name}
                className={`!min-h-12 !py-3 ${
                  isSelected
                    ? "!bg-black/25 hover:!bg-black/20"
                    : "!bg-transparent hover:!bg-white/[0.08]"
                } ${
                  isCollapsed ? "!justify-center !px-0" : "!justify-start !px-6"
                }`}
              >
                {isCollapsed ? (
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isSelected ? "bg-white" : "bg-gray-200/50"
                    }`}
                  />
                ) : (
                  <ListItemText
                    primary={campaign.name}
                    slotProps={{
                      primary: {
                        className: `!text-white !text-base font-semibold`,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </div>

      <div className="px-4 pb-6 flex flex-col gap-3">
        <Button
          variant="contained"
          startIcon={!isCollapsed && <AddIcon />}
          onClick={handleNewCampaign}
          fullWidth
          className="!bg-white !text-[#00A63E] !rounded-xl !normal-case !font-semibold !text-base !py-2.5 !shadow-none hover:!bg-gray-100 hover:!shadow-none"
        >
          {isCollapsed ? <AddIcon /> : "New Campaign"}
        </Button>

        <Button
          onClick={handleLogout}
          fullWidth
          aria-label="Logout"
          className={`!text-white !uppercase !underline !font-medium !tracking-[1.5px] !text-[0.85rem] ${
            isCollapsed ? "!justify-center" : "!justify-start"
          }`}
        >
          <LogoutIcon className="!text-[28px]" />
          {!isCollapsed && <span className="ml-2">LOGOUT</span>}
        </Button>
      </div>
    </nav>
  );
}
