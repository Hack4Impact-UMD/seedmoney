"use client";

import type { SyntheticEvent } from "react";
import { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

type DashboardTabValue = "overview" | "donors" | "analytics";

type DashboardTabsProps = {
  value?: DashboardTabValue;
  onChange?: (value: DashboardTabValue) => void;
  className?: string;
};

export default function DashboardTabs({
  value,
  onChange,
  className,
}: DashboardTabsProps) {
  const [internalValue, setInternalValue] =
    useState<DashboardTabValue>("analytics");

  const activeValue = value ?? internalValue;

  const handleChange = (
    _event: SyntheticEvent,
    newValue: DashboardTabValue,
  ) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <Tabs
      value={activeValue}
      onChange={handleChange}
      aria-label="Dashboard tabs"
      className={[
        "w-fit [&_.MuiTabs-indicator]:!h-[3px] [&_.MuiTabs-indicator]:!bg-[#008832]",
        className ?? "",
      ].join(" ")}
      variant="standard"
    >
      <Tab
        disableRipple
        value="overview"
        label="Overview"
        className="!min-w-0 !px-10 !py-4 !normal-case !font-semibold !text-[40px] !leading-none !text-black/60 [&.Mui-selected]:!text-[#008832]"
      />
      <Tab
        disableRipple
        value="donors"
        label="Donors"
        className="!min-w-0 !px-10 !py-4 !normal-case !font-semibold !text-[40px] !leading-none !text-black/60 [&.Mui-selected]:!text-[#008832]"
      />
      <Tab
        disableRipple
        value="analytics"
        label="Analytics"
        className="!min-w-0 !px-10 !py-4 !normal-case !font-semibold !text-[40px] !leading-none !text-black/60 [&.Mui-selected]:!text-[#008832]"
      />
    </Tabs>
  );
}
