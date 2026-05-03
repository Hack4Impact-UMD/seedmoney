"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Options = {
  initialCount?: number;
  increment?: number;
  resetKey: string;
};

export default function useIncrementalMobileList<T>(
  items: T[],
  { initialCount = 12, increment = 12, resetKey }: Options,
) {
  const [state, setState] = useState({
    key: resetKey,
    count: initialCount,
  });
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const requestedCount = state.key === resetKey ? state.count : initialCount;
  const visibleCount = Math.min(requestedCount, items.length);

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setState((current) => {
      const currentCount =
        current.key === resetKey ? current.count : initialCount;

      return {
        key: resetKey,
        count: Math.min(currentCount + increment, items.length),
      };
    });
  }, [increment, initialCount, items.length, resetKey]);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, visibleCount]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  return {
    visibleItems,
    visibleCount,
    hasMore,
    loadMore,
    sentinelRef,
  };
}
