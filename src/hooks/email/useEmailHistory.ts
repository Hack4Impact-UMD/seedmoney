"use client";

import { useQuery } from "@tanstack/react-query";
import { readEmailHistory, readEmailHistoryDetail, readEmailHistoryMonths } from "@/src/actions/email/history";
import type { EmailHistoryInput, EmailHistoryResult } from "@/src/types/emailHistory";

async function unwrap<T>(result: Promise<EmailHistoryResult<T>>) {
  const value = await result;
  if (!value.success) throw new Error(value.error);
  return value.data;
}

export function useEmailHistory(input: EmailHistoryInput) {
  return useQuery({ queryKey: ["admin-emails", "history", input],
    queryFn: () => unwrap(readEmailHistory(input)), refetchInterval: 30_000 });
}

export function useEmailHistoryMonths() {
  return useQuery({ queryKey: ["admin-emails", "history-months"],
    queryFn: () => unwrap(readEmailHistoryMonths()), refetchInterval: 30_000 });
}

export function useEmailHistoryDetail(id: string | null) {
  return useQuery({ queryKey: ["admin-emails", "history-detail", id], enabled: Boolean(id),
    queryFn: () => unwrap(readEmailHistoryDetail(id!)) });
}
