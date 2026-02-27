"use client";

import { SyntheticEvent } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const tabOptions = ["Overview", "Donors", "Analytics"] as const;

type DashboardTabsProps = {
  selectedTab: string;
  onChange: (newValue: string) => void;
};

export default function DashboardTabs({
  selectedTab,
  onChange,
}: DashboardTabsProps) {
  const handleChange = (_: SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Tabs
      value={selectedTab}
      onChange={handleChange}
      aria-label="Dashboard tabs"
      className="w-fit [&_.MuiTabs-indicator]:!h-[3px] [&_.MuiTabs-indicator]:!bg-[#008832]"
      variant="standard"
    >
      {tabOptions.map((tab) => (
        <Tab
          key={tab}
          disableRipple
          value={tab}
          label={tab}
          className="!min-w-0 !min-h-[38px] !px-5 !py-2 !normal-case !font-semibold !text-sm !leading-[1.25] !text-black/60 [&.Mui-selected]:!text-[#008832]"
        />
      ))}
    </Tabs>
  );
}
