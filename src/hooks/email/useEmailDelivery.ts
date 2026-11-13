"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createBrowserClient } from "@/src/lib/supabase-client";
import { readPendingAdminEmail } from "@/src/actions/email/delivery";
import { sendEmailBatches } from "@/src/lib/emailDelivery";
import type { EmailBatchProgress, PendingAdminEmail } from "@/src/types/db/adminEmails";

export default function useEmailDelivery() {
  const [job, setJob] = useState<PendingAdminEmail | null>(null);
  const [progress, setProgress] = useState<EmailBatchProgress | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const running = useRef(false);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setIsLoaded(false);
    try {
      const result = await readPendingAdminEmail();
      if (!mounted.current || request !== generation.current) return;
      if (!result.success) { setError(result.error); return; }
      setJob(result.email);
      setError(null);
      setIsLoaded(true);
    } catch {
      if (mounted.current && request === generation.current) setError("Unable to check queued emails. Please retry.");
    }
  }, []);

  const send = useCallback(async (email: PendingAdminEmail) => {
    if (running.current || !mounted.current) return;
    running.current = true;
    const abort = new AbortController();
    controller.current = abort;
    setJob(email);
    setProgress(null);
    setError(null);
    setIsSending(true);
    try {
      const supabase = createBrowserClient();
      await sendEmailBatches(email.id, () => supabase.functions.invoke("send-admin-email", {
        body: { email_id: email.id }, signal: abort.signal, timeout: 45_000,
      }), batch => { if (mounted.current) setProgress(batch); }, abort.signal);
      if (mounted.current && !abort.signal.aborted) await refresh();
    } catch (failure) {
      if (mounted.current && !abort.signal.aborted) setError(failure instanceof Error ? failure.message : "Delivery stopped. Resume this same email.");
    } finally {
      running.current = false;
      controller.current = null;
      if (mounted.current) setIsSending(false);
    }
  }, [refresh]);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const warn = (event: BeforeUnloadEvent) => {
      if (running.current) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      mounted.current = false;
      controller.current?.abort();
      window.removeEventListener("beforeunload", warn);
    };
  }, [refresh]);

  return { job, progress, isSending, isLoaded, error, send, refresh };
}
