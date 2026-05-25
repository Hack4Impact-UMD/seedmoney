"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

export type DashboardTabItem = {
  label: string;
  sectionId: string;
};

type DashboardTabsProps = {
  tabs: readonly DashboardTabItem[];
};

export default function DashboardTabs({ tabs }: DashboardTabsProps) {
  const [selectedSectionId, setSelectedSectionId] = useState(
    tabs[0]?.sectionId ?? "",
  );

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.sectionId))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const closestVisibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          )[0];

        if (closestVisibleSection) {
          setSelectedSectionId(closestVisibleSection.target.id);
        }
      },
      {
        rootMargin: "-72px 0px -55% 0px",
        threshold: [0, 0.1],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [tabs]);

  const handleChange = (_: SyntheticEvent, newValue: string) => {
    setSelectedSectionId(newValue);
    document.getElementById(newValue)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Tabs
      value={selectedSectionId}
      onChange={handleChange}
      aria-label="Dashboard tabs"
      className="sticky top-0 z-10 w-fit bg-inherit [&_.MuiTabs-indicator]:!h-[3px] [&_.MuiTabs-indicator]:!bg-[#1976D2] mt-5 mb-5"
      variant="standard"
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.sectionId}
          disableRipple
          value={tab.sectionId}
          label={tab.label}
          className="!min-w-0 !min-h-[38px] !px-5  !normal-case !font-semibold !text-sm !leading-[1.25] !text-black/60 [&.Mui-selected]:!text-[#1976D2]"
        />
      ))}
    </Tabs>
  );
}
