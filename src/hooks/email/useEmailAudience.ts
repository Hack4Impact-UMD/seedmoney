"use client";

import { useQuery } from "@tanstack/react-query";
import { readEmailAudienceSummary } from "@/src/actions/email/recipients";
import type { AdminEmailGroup } from "@/src/types/db/adminEmails";

export default function useEmailAudience(groups: AdminEmailGroup[], enabled = true) {
  const selection = [...new Set(groups)].sort();
  return useQuery({
    queryKey: ["admin-emails", "audience", selection],
    queryFn: async () => {
      const result = await readEmailAudienceSummary(selection);
      if (!result.success) throw new Error(result.error);
      return result.summary;
    },
    enabled,
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
