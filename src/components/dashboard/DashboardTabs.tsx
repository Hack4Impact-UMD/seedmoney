"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

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
  const scrollTargetRef = useRef<string | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  const activateSection = useCallback((sectionId: string) => {
    selectedSectionIdRef.current = sectionId;
    setSelectedSectionId(sectionId);
  }, []);

  const releaseScrollTarget = useCallback(() => {
    scrollTargetRef.current = null;

    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
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

      if (scrollTargetRef.current !== null) {
        return;
      }

      const stickyBottom =
        (tabsRef.current?.getBoundingClientRect().bottom ?? 0) + 1;
      const activationLine =
        stickyBottom +
        Math.min(160, (window.innerHeight - stickyBottom) * 0.25);
      const isAtDocumentEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 1;
      const nextSection = isAtDocumentEnd
        ? sections[sections.length - 1]
        : sections
            .findLast(
              (section) =>
                section.getBoundingClientRect().top <= activationLine,
            ) ?? sections[0];

      if (nextSection.id !== selectedSectionIdRef.current) {
        activateSection(nextSection.id);
      }
    };

    const scheduleUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateActiveSection);
      }
    };

    const releaseAndUpdate = () => {
      releaseScrollTarget();
      scheduleUpdate();
    };

    const handleManualKeyScroll = (event: KeyboardEvent) => {
      if (
        [
          "ArrowDown",
          "ArrowUp",
          "End",
          "Home",
          "PageDown",
          "PageUp",
          " ",
        ].includes(event.key)
      ) {
        releaseAndUpdate();
      }
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scrollend", releaseAndUpdate);
    window.addEventListener("wheel", releaseAndUpdate, { passive: true });
    window.addEventListener("touchstart", releaseAndUpdate, { passive: true });
    window.addEventListener("keydown", handleManualKeyScroll);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scrollend", releaseAndUpdate);
      window.removeEventListener("wheel", releaseAndUpdate);
      window.removeEventListener("touchstart", releaseAndUpdate);
      window.removeEventListener("keydown", handleManualKeyScroll);
      releaseScrollTarget();
    };
  }, [activateSection, releaseScrollTarget, tabs]);

  const handleChange = (
    event: MouseEvent<HTMLAnchorElement>,
    newValue: string,
  ) => {
    event.preventDefault();
    releaseScrollTarget();
    scrollTargetRef.current = newValue;
    activateSection(newValue);
    document.getElementById(newValue)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    scrollTimeoutRef.current = window.setTimeout(releaseScrollTarget, 1500);
  };

  return (
    <nav
      ref={tabsRef}
      aria-label="Dashboard sections"
      className="sticky top-0 z-10 mt-5 mb-5 w-fit bg-inherit"
    >
      <div className="flex">
        {tabs.map((tab) => {
          const isCurrent = selectedSectionId === tab.sectionId;

          return (
            <a
              key={tab.sectionId}
              href={`#${tab.sectionId}`}
              aria-current={isCurrent ? "location" : undefined}
              onClick={(event) => handleChange(event, tab.sectionId)}
              className={`inline-flex min-h-[38px] items-center border-b-[3px] px-5 text-sm font-semibold leading-[1.25] no-underline ${
                isCurrent
                  ? "border-[#1976D2] text-[#1976D2]"
                  : "border-transparent text-black/60"
              }`}
            >
              {tab.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
