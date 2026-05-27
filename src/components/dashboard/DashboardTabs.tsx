"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
  showMobileScrollControls?: boolean;
};

type TabScrollControls = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

export default function DashboardTabs({
  tabs,
  showMobileScrollControls = false,
}: DashboardTabsProps) {
  const [selectedSectionId, setSelectedSectionId] = useState(
    tabs[0]?.sectionId ?? "",
  );
  const [tabScrollControls, setTabScrollControls] = useState<TabScrollControls>(
    {
      canScrollLeft: false,
      canScrollRight: false,
    },
  );
  const selectedSectionIdRef = useRef(selectedSectionId);
  const tabsRef = useRef<HTMLElement | null>(null);
  const tabsScrollerRef = useRef<HTMLDivElement | null>(null);
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
      let nextSection = isAtDocumentEnd
        ? sections[sections.length - 1]
        : sections[0];

      if (!isAtDocumentEnd) {
        for (let index = sections.length - 1; index >= 0; index -= 1) {
          if (sections[index].getBoundingClientRect().top <= activationLine) {
            nextSection = sections[index];
            break;
          }
        }
      }

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

  const updateTabScrollControls = useCallback(() => {
    const scroller = tabsScrollerRef.current;

    if (!scroller) {
      return;
    }

    const remainingScroll = scroller.scrollWidth - scroller.clientWidth;
    const boundaryOffset = 1;
    const nextControls = {
      canScrollLeft: scroller.scrollLeft > boundaryOffset,
      canScrollRight:
        remainingScroll > boundaryOffset &&
        scroller.scrollLeft < remainingScroll - boundaryOffset,
    };

    setTabScrollControls((controls) =>
      controls.canScrollLeft === nextControls.canScrollLeft &&
      controls.canScrollRight === nextControls.canScrollRight
        ? controls
        : nextControls,
    );
  }, []);

  useEffect(() => {
    if (!showMobileScrollControls) {
      return;
    }

    const scroller = tabsScrollerRef.current;

    if (!scroller) {
      return;
    }

    const initialMeasurementFrame = window.requestAnimationFrame(
      updateTabScrollControls,
    );
    scroller.addEventListener("scroll", updateTabScrollControls, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(updateTabScrollControls);
    resizeObserver.observe(scroller);

    return () => {
      window.cancelAnimationFrame(initialMeasurementFrame);
      scroller.removeEventListener("scroll", updateTabScrollControls);
      resizeObserver.disconnect();
    };
  }, [showMobileScrollControls, tabs, updateTabScrollControls]);

  const scrollTabs = (direction: -1 | 1) => {
    tabsScrollerRef.current?.scrollBy({
      left: direction * tabsScrollerRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const handleChange = (
    event: MouseEvent<HTMLAnchorElement>,
    newValue: string,
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = document.getElementById(newValue);

    if (!target) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      releaseScrollTarget();
      activateSection(newValue);
      return;
    }

    event.preventDefault();
    releaseScrollTarget();
    scrollTargetRef.current = newValue;
    activateSection(newValue);

    if (window.location.hash !== `#${newValue}`) {
      window.history.pushState(null, "", `#${newValue}`);
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    scrollTimeoutRef.current = window.setTimeout(releaseScrollTarget, 1500);
  };

  return (
    <nav
      ref={tabsRef}
      aria-label="Dashboard sections"
      className="sticky top-0 z-10 mt-5 mb-5 w-full bg-inherit md:w-fit"
    >
      <div className="flex w-full items-stretch">
        {showMobileScrollControls && tabScrollControls.canScrollLeft && (
          <button
            type="button"
            aria-label="Show previous dashboard tabs"
            onClick={() => scrollTabs(-1)}
            className="flex w-10 shrink-0 items-center justify-center text-black/60 md:hidden"
          >
            <ChevronLeftIcon fontSize="small" />
          </button>
        )}
        <div
          ref={showMobileScrollControls ? tabsScrollerRef : undefined}
          className={`flex min-w-0 flex-1 ${
            showMobileScrollControls
              ? "overflow-x-auto scrollbar-hide md:overflow-visible"
              : ""
          }`}
        >
          {tabs.map((tab) => {
            const isCurrent = selectedSectionId === tab.sectionId;

            return (
              <a
                key={tab.sectionId}
                href={`#${tab.sectionId}`}
                aria-current={isCurrent ? "location" : undefined}
                onClick={(event) => handleChange(event, tab.sectionId)}
                className={`inline-flex min-h-[38px] min-w-0 items-center justify-center border-b-[3px] text-sm font-semibold leading-[1.25] no-underline md:flex-none md:px-5 ${
                  showMobileScrollControls ? "shrink-0 px-4" : "flex-1 px-0"
                } ${
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
        {showMobileScrollControls && tabScrollControls.canScrollRight && (
          <button
            type="button"
            aria-label="Show more dashboard tabs"
            onClick={() => scrollTabs(1)}
            className="flex w-10 shrink-0 items-center justify-center text-black/60 md:hidden"
          >
            <ChevronRightIcon fontSize="small" />
          </button>
        )}
      </div>
    </nav>
  );
}
