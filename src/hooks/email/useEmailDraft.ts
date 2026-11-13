"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { discardEmailDraft, readLatestEmailDraft, saveEmailDraft } from "@/src/actions/email/drafts";
import { emailDraftValuesError } from "@/src/lib/emailDraftValidation";
import type { AdminEmailDraft, EmailDraftResult, EmailDraftValues, SaveEmailDraftInput } from "@/src/types/db/adminEmails";

const emptyValues = (): EmailDraftValues => ({ subject: "", bodyHtml: "", recipientGroups: [] });
const keyFor = (values: EmailDraftValues) => JSON.stringify(values);
type DraftError = Extract<EmailDraftResult, { success: false }> & { operation?: "discard" };

export default function useEmailDraft() {
  const [values, setValues] = useState<EmailDraftValues>(emptyValues);
  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState<"loading" | "unsaved" | "saving" | "saved" | "error">("loading");
  const [error, setError] = useState<DraftError | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const current = useRef(values);
  const draft = useRef<AdminEmailDraft | null>(null);
  const savedKey = useRef(keyFor(values));
  const pendingWrite = useRef<SaveEmailDraftInput | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);
  const ready = useRef(false);
  const discarding = useRef(false);
  const mounted = useRef(false);
  const loadGeneration = useRef(0);
  const lastError = useRef<DraftError | null>(null);

  const showError = useCallback((failure: DraftError) => {
    lastError.current = failure;
    if (mounted.current) { setError(failure); setStatus("error"); }
  }, []);

  const load = useCallback(async () => {
    const generation = ++loadGeneration.current;
    ready.current = false;
    setIsLoaded(false);
    setStatus("loading");
    try {
      const result = await readLatestEmailDraft();
      if (!mounted.current || generation !== loadGeneration.current) return;
      if (!result.success) { showError(result); return; }
      const row = result.draft;
      const next = row ? { subject: row.subject, bodyHtml: row.body_html, recipientGroups: row.recipient_groups } : emptyValues();
      draft.current = row;
      current.current = next;
      savedKey.current = keyFor(next);
      pendingWrite.current = null;
      lastError.current = null;
      ready.current = true;
      setValues(next);
      setSavedAt(row?.updated_at ?? null);
      setError(null);
      setIsLoaded(true);
      setStatus("saved");
    } catch {
      if (mounted.current && generation === loadGeneration.current) {
        showError({ success: false, code: "error", error: "Unable to load your draft. Please retry before editing." });
      }
    }
  }, [showError]);

  const flush = useCallback(async function flushDraft(): Promise<void> {
    if (!ready.current) return;
    if (lastError.current) throw new Error(lastError.current.error);
    if (inFlight.current) { await inFlight.current; return flushDraft(); }
    if (!pendingWrite.current && keyFor(current.current) === savedKey.current) return;

    if (mounted.current) setStatus("saving");
    const save = async () => {
      try {
        // Serialize writes and replay an unacknowledged request before newer edits.
        while (pendingWrite.current || keyFor(current.current) !== savedKey.current) {
          const invalidFields = emailDraftValuesError(pendingWrite.current ?? current.current);
          if (invalidFields) {
            showError({ success: false, code: "validation", error: invalidFields });
            throw new Error(invalidFields);
          }
          const input = pendingWrite.current ?? {
            ...current.current, id: draft.current?.id ?? crypto.randomUUID(), version: draft.current?.version ?? 0,
          };
          pendingWrite.current = input;
          const result = await saveEmailDraft(input);
          if (!result.success) {
            if (result.code === "validation") pendingWrite.current = null;
            showError(result);
            throw new Error(result.error);
          }
          if (!result.draft) throw new Error("The saved draft was not returned.");
          draft.current = result.draft;
          savedKey.current = keyFor({ subject: input.subject, bodyHtml: input.bodyHtml, recipientGroups: input.recipientGroups });
          pendingWrite.current = null;
          if (mounted.current) setSavedAt(result.draft.updated_at);
        }
        if (mounted.current) setStatus("saved");
      } catch (failure) {
        if (!lastError.current) showError({ success: false, code: "error", error: "Unable to save your draft. Your edits are still in this tab. Please retry." });
        throw failure;
      } finally {
        inFlight.current = null;
      }
    };
    // Register the promise before save can fail synchronously during validation.
    inFlight.current = Promise.resolve().then(save);
    await inFlight.current;
  }, [showError]);

  const update = useCallback((fields: Partial<EmailDraftValues>) => {
    if (!ready.current || discarding.current) return;
    if (lastError.current?.code === "validation") {
      lastError.current = null;
      setError(null);
    }
    current.current = { ...current.current, ...fields };
    setValues(current.current);
    if (!lastError.current) setStatus(inFlight.current ? "saving" : "unsaved");
  }, []);

  const discard = useCallback(async () => {
    if (!ready.current || discarding.current) return false;
    if (lastError.current?.code === "error") {
      lastError.current = null;
      setError(null);
    }
    discarding.current = true;
    setIsDiscarding(true);
    try {
      await flush();
      if (draft.current) {
        const result = await discardEmailDraft(draft.current.id, draft.current.version);
        if (!result.success) { showError({ ...result, operation: "discard" }); return false; }
      }
      draft.current = null;
      pendingWrite.current = null;
      current.current = emptyValues();
      savedKey.current = keyFor(current.current);
      setValues(current.current);
      setSavedAt(null);
      setStatus("saved");
      return true;
    } catch {
      if (!lastError.current) showError({ success: false, code: "error", operation: "discard", error: "Unable to discard your draft. Please retry." });
      return false;
    } finally {
      discarding.current = false;
      setIsDiscarding(false);
    }
  }, [flush, showError]);

  const retry = useCallback(async () => {
    if (!ready.current) return load();
    if (lastError.current?.code === "conflict") return;
    const operation = lastError.current?.operation;
    lastError.current = null;
    setError(null);
    if (operation === "discard") { await discard(); return; }
    await flush().catch(() => { /* flush displays the save error. */ });
  }, [discard, flush, load]);

  useEffect(() => {
    mounted.current = true;
    load();
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (pendingWrite.current || inFlight.current || discarding.current || keyFor(current.current) !== savedKey.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      mounted.current = false;
      window.removeEventListener("beforeunload", beforeUnload);
      if (!lastError.current && !discarding.current) {
        flush().catch(failure => console.error("Unable to finish email draft save:", failure));
      }
    };
  }, [flush, load]);

  useEffect(() => {
    if (!isLoaded || error || isDiscarding) return;
    const timer = setTimeout(() => { flush().catch(() => { /* flush displays the save error. */ }); }, 700);
    return () => clearTimeout(timer);
  }, [values, isLoaded, error, isDiscarding, flush]);

  return { values, update, status, error, savedAt, isLoaded, isDiscarding,
    hasDraft: Boolean(draft.current), isDirty: keyFor(values) !== savedKey.current,
    flush, retry, reload: load, discard };
}
