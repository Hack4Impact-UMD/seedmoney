"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
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
  const selectedSectionIdRef = useRef(selectedSectionId);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  const activateSection = useCallback((sectionId: string) => {
    selectedSectionIdRef.current = sectionId;
    setSelectedSectionId(sectionId);
  }, []);

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.sectionId))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return;
    }

    let frameId: number | null = null;

    const updateActiveSection = () => {
      frameId = null;

      const stickyBottom =
        (tabsRef.current?.getBoundingClientRect().bottom ?? 0) + 1;
      const visibleSections = sections.filter((section) => {
        const bounds = section.getBoundingClientRect();

        return bounds.bottom > stickyBottom && bounds.top < window.innerHeight;
      });

      if (
        visibleSections.some(
          (section) => section.id === selectedSectionIdRef.current,
        )
      ) {
        return;
      }

      const lastPassedSection = sections
        .filter(
          (section) => {
            const bounds = section.getBoundingClientRect();

            return bounds.top <= stickyBottom && bounds.bottom > stickyBottom;
          },
        )
        .at(-1);
      const nextSection =
        lastPassedSection ?? visibleSections[0] ?? sections[0];

      if (nextSection.id !== selectedSectionIdRef.current) {
        activateSection(nextSection.id);
      }
    };

    const scheduleUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateActiveSection);
      }
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [activateSection, tabs]);

  const handleChange = (_: SyntheticEvent, newValue: string) => {
    activateSection(newValue);
    document.getElementById(newValue)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Tabs
      ref={tabsRef}
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
