"use client";

import { useQuery } from "@tanstack/react-query";
import { readSentAdminEmails } from "@/src/actions/email/history";

export default function useSentEmails() {
  return useQuery({
    queryKey: ["admin-emails", "history"],
    queryFn: async () => {
      const result = await readSentAdminEmails();
      if (!result.success) throw new Error(result.error);
      return result.emails;
    },
    retry: 1,
  });
}
