"use client";

import { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import Navbar from "@/src/components/Navbar"
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseIcon from "@mui/icons-material/Close";
import BaseModal from "@/src/components/bases/BaseModal";
import EmailEditor, {
  type EmailEditorHandle,
} from "@/src/components/email/EmailEditor";
import EmailPreviewBody from "@/src/components/email/EmailPreviewBody";
import EmailRecipientsModal from "@/src/components/email/EmailRecipientsModal";
import EmailStatusToast from "@/src/components/email/EmailStatusToast";
import EmailUsersHeader from "@/src/components/email/EmailUsersHeader";
import { rememberEmailImageSize } from "@/src/components/email/EmailImageNode";
import { FIRST_NAME_FALLBACK } from "@/src/lib/emailRecipients";
import { useAuth } from "@/src/context/AuthProvider";
import useSentEmails from "@/src/hooks/email/useSentEmails";
import { EMAIL_SENT_FLAG } from "@/src/constants/emailConstants";
import useUploadEmailImage from "@/src/hooks/email/useUploadEmailImage";
import useEmailDraft from "@/src/hooks/email/useEmailDraft";
import useEmailAudience from "@/src/hooks/email/useEmailAudience";
import useEmailDelivery from "@/src/hooks/email/useEmailDelivery";
import { queueAdminEmail } from "@/src/actions/email/queue";
import { sendAdminTestEmail } from "@/src/actions/email/test";
import { validateEmailForSend } from "@/src/actions/email/validate";
import { ADMIN_EMAIL_GROUP_LABELS, type AdminEmailGroup } from "@/src/types/db/adminEmails";
import { MAX_EMAIL_IMAGE_BYTES } from "@/src/actions/db/email-images";
import {
  EXAMPLE_TOKEN_VALUES,
  fillEmailTokens,
  fillTextTokens,
  tokenPattern,
} from "@/src/components/email/emailTokens";
import { useRouter } from "next/navigation";

// Text buttons get an outline on phones, where they sit in a two-column grid
const MOBILE_OUTLINED = "max-md:border! max-md:border-solid! max-md:border-[#123A1E]! max-md:py-1.5!";

export default function EmailUsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const draft = useEmailDraft();
  const delivery = useEmailDelivery();
  const { subject, bodyHtml, recipientGroups } = draft.values;
  const audience = useEmailAudience(recipientGroups, draft.isLoaded);
  const [uploadError, setUploadError] = useState("");
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const editorRef = useRef<EmailEditorHandle>(null);
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadEmailImage();
  const sentEmails = useSentEmails();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [recipientsOpen, setRecipientsOpen] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [sendCopy, setSendCopy] = useState(false);
  const [nameWarningDismissed, setNameWarningDismissed] = useState(false);
  const [testSendOpen, setTestSendOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSendNotice, setTestSendNotice] = useState<string | null>(null);
  const testRequest = useRef<{ key: string; id: string } | null>(null);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const validationInFlight = useRef(false);
  const [validation, setValidation] = useState<{ key: string; errors: string[] } | null>(null);
  const [validatedRecipientCount, setValidatedRecipientCount] = useState<number | null>(null);
  const validationKey = JSON.stringify({ subject, bodyHtml, recipientGroups, testEmail });
  const validationErrors = validation?.key === validationKey ? validation.errors : [];
  const canEdit = draft.isLoaded && !draft.isDiscarding && !isValidating && !delivery.isSending;
  const audienceReady = draft.isLoaded && audience.isSuccess && !audience.isFetching;
  const wrongCompetition = audienceReady && draft.hasDraft && draft.competitionId !== audience.data.competitionId;
  const canPrepareSend = canEdit && delivery.isLoaded && !delivery.job && !delivery.error && !draft.error && audienceReady && !wrongCompetition &&
    audience.data.total > 0 && recipientGroups.length > 0 && Boolean(subject.trim()) && !isUploadingBatch;

  const isValidTestEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim());

  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
    },
    multiple: true,
    maxSize: MAX_EMAIL_IMAGE_BYTES,
    disabled: !canEdit || isUploadingImage || isUploadingBatch,

    // Upload each image to storage, then insert it where the cursor is
    onDropAccepted: async (files) => {
      setUploadError("");
      setIsUploadingBatch(true);
      try {
        for (const file of files) {
          try {
            const url = await uploadImage(file);
            rememberEmailImageSize(url, file.size);
            editorRef.current?.insertImage(url, file.name);
          } catch (error) {
            console.error(error);
            setUploadError(`Couldn't upload ${file.name}. Please try again.`);
          }
        }
      } finally {
        setIsUploadingBatch(false);
      }
    },
  
    onDropRejected: () => {
      setUploadError("Only PNG, JPG or GIF images under 3MB are allowed.");
    },
  });

  const groupLabels = ADMIN_EMAIL_GROUP_LABELS;

  const validateSend = async (mode: "send" | "test", confirm = false) => {
    if (validationInFlight.current) return;
    validationInFlight.current = true;
    setIsValidating(true);
    setValidation(null);
    setTestSendNotice(null);
    try {
      await draft.flush();
      if (mode === "send" && confirm) {
        const identity = draft.getSavedIdentity();
        if (!identity) throw new Error("Draft not saved");
        const queued = await queueAdminEmail({ ...identity, sendCopy });
        if (!queued.success) { setValidation({ key: validationKey, errors: queued.errors }); return; }
        setSendConfirmOpen(false);
        await draft.reload();
        setIsValidating(false);
        if (queued.receipt.alreadyQueued) {
          // Another tab may have queued a different version. Require an explicit resume.
          await delivery.refresh();
        } else {
          const sent = await delivery.send({ id: queued.receipt.emailId, subject, status: queued.receipt.status,
            recipientCount: queued.receipt.recipientCount });
          if (sent) {
            // Sent history shows the "Email sent!" alert once it opens
            try { sessionStorage.setItem(EMAIL_SENT_FLAG, "1"); } catch { /* The alert is optional. */ }
            router.push("/dashboard/email-users/sent-history");
          } else {
            setSendFailed(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
        return;
      }
      const input = { ...draft.values, mode, testEmail,
        competitionId: draft.hasDraft ? draft.competitionId : audience.data?.competitionId ?? null };
      if (mode === "test") {
        if (testRequest.current?.key !== validationKey) testRequest.current = { key: validationKey, id: crypto.randomUUID() };
        try {
          const result = await sendAdminTestEmail({ ...input, requestId: testRequest.current.id });
          if (result.success) setTestSendNotice(result.testEmail);
          else setValidation({ key: validationKey, errors: result.errors });
          if (result.success) testRequest.current = null;
        } catch {
          setValidation({ key: validationKey, errors: ["Unable to confirm the test email. Check your inbox or provider logs before trying again."] });
        }
        return;
      }
      const result = await validateEmailForSend(input);
      if (!result.success) { setValidation({ key: validationKey, errors: result.errors }); return; }
      setValidatedRecipientCount(result.recipientCount);
      setSendConfirmOpen(true);
    } catch {
      setValidation({ key: validationKey, errors: ["Unable to save or validate this email. Your draft is still available; please retry."] });
    } finally {
      validationInFlight.current = false;
      setIsValidating(false);
    }
  };
  const validationNotice = validationErrors.length > 0 && (
    <ul role="alert" className="space-y-1 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {validationErrors.map(error => <li key={error}>{error}</li>)}
    </ul>
  );

  const handleDiscard = async () => {
    if (!window.confirm("Discard this draft? This cannot be undone.")) return;
    if (await draft.discard()) setUploadError("");
  };

  // Recipients without a first name are greeted as "Hi There"
  const usesFirstName = [...`${subject}\n${bodyHtml}`.matchAll(tokenPattern())].some(match => match[1] === "first_name");
  const missingFirstNames = audienceReady && usesFirstName && audience.data.missingFirstNames > 0;
  const previewValues = missingFirstNames
    ? { ...EXAMPLE_TOKEN_VALUES, first_name: FIRST_NAME_FALLBACK }
    : EXAMPLE_TOKEN_VALUES;

  // Phones show who the email goes to on the send button itself
  const sendToLabel = audienceReady && recipientGroups.length > 0 && audience.data.total > 0
    ? `Send to ${audience.data.total.toLocaleString()} ${audience.data.total === 1 ? "user" : "users"}`
    : "Send";

  const saveLabel = !draft.isLoaded
    ? draft.error ? "Draft unavailable" : "Loading draft..."
    : draft.isDiscarding ? "Discarding..."
    : draft.status === "saving" ? "Saving..."
    : draft.error ? "Draft not saved"
    : draft.isDirty ? "Unsaved changes"
    : draft.savedAt ? `Auto saved at ${new Date(draft.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
    : "No draft saved";

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="flex-1 bg-[#F6FAF9] px-4 py-8 pb-24 md:px-10 md:py-[60px] md:pb-[60px]">
        <div className="flex w-full flex-col gap-4 md:gap-6">
          <EmailUsersHeader
            active="compose"
            subtitle="Send an update to a group of Seedmoney users."
            sentCount={sentEmails.data?.length}
            onSentHistoryClick={async (event) => {
              event.preventDefault();
              if (!canEdit || isUploadingBatch) return;
              try {
                await draft.flush();
                router.push("/dashboard/email-users/sent-history");
              } catch { /* The draft error is displayed below. */ }
            }}
          />

          {(delivery.job || delivery.progress || delivery.error) && (
            <div className="space-y-2 rounded-md border border-gray-200 bg-white p-4 text-sm" aria-live="polite">
              {delivery.job && <p className="break-words font-semibold">{delivery.job.subject} ({delivery.job.recipientCount.toLocaleString()} recipients)</p>}
              {delivery.progress && (!delivery.job || delivery.progress.email_id === delivery.job.id) && (
                <p>
                  {delivery.progress.done ? "Sending finished." : "Sending in progress."} {delivery.progress.counts.accepted.toLocaleString()} accepted by the email provider;
                  {" "}{delivery.progress.counts.failed.toLocaleString()} failed; {delivery.progress.counts.unknown.toLocaleString()} uncertain.
                </p>
              )}
              {delivery.progress?.needs_manual_review && <p role="alert" className="text-amber-800">Check provider logs for uncertain recipients before retrying them. They will not be resent automatically.</p>}
              {delivery.isSending && <p>Keep this page open until sending finishes.</p>}
              {delivery.error && <p role="alert" className="text-red-700">{delivery.error}</p>}
              {delivery.job && <Button size="small" disabled={delivery.isSending || isValidating || isUploadingBatch || draft.isDiscarding}
                onClick={() => delivery.send(delivery.job!)}>{delivery.isSending ? "Sending..." : "Resume sending"}</Button>}
              {!delivery.isLoaded && !delivery.isSending && <Button size="small" onClick={delivery.refresh}>Check queued emails</Button>}
            </div>
          )}

          {draft.error && (
            <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>{draft.error.error}</p>
              {draft.error.code === "conflict" ? (
                <Button size="small" onClick={() => {
                  if (window.confirm("Reloading will replace your unsaved edits with the saved draft. Continue?")) draft.reload();
                }}>Reload draft</Button>
              ) : <Button size="small" onClick={draft.retry}>Retry</Button>}
            </div>
          )}

          <section inert={!canEdit} className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-3 flex flex-col md:mb-2 md:flex-row md:items-center md:gap-3">
              <h2 className="text-lg font-semibold text-[#123A1E]">
                1. Recipients
              </h2>
              <p className="text-[#8E938E] text-sm">Choose one or more groups</p>
            </div>
            {recipientGroups.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {recipientGroups.map((group) => (
                  <Chip
                    key={group}
                    label={groupLabels[group]}
                    variant="outlined"
                    color="success"
                    onDelete={() =>
                      draft.update({ recipientGroups: recipientGroups.filter((item) => item !== group) })
                    }
                  />
                ))}
              </div>
            )}

            <FormControl fullWidth>
              <InputLabel id="recipient-groups-label">
                Recipient groups
              </InputLabel>

              <Select<AdminEmailGroup[]>
                labelId="recipient-groups-label"
                value={recipientGroups}
                label="Recipient groups"
                multiple
                renderValue={() =>(
                    <span className="text-gray-400">
                      Add another group...
                    </span>
                  )
                }
                onChange={(event) => {
                  const value = event.target.value;

                  draft.update({ recipientGroups: typeof value === "string" ? value.split(",") as AdminEmailGroup[] : value });
                }}
              >
                {Object.entries(groupLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label} ({audienceReady ? audience.data.groupCounts[value as AdminEmailGroup].toLocaleString() : "..."})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {audience.isError && (
              <div role="alert" className="mt-3 flex flex-wrap items-center gap-3 text-sm text-red-700">
                <p>{audience.error.message}</p>
                <Button size="small" onClick={() => audience.refetch()}>Retry recipients</Button>
              </div>
            )}
            {wrongCompetition && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                This draft belongs to a different or removed competition. Discard it and start a new draft before sending.
              </p>
            )}
            {audienceReady && audience.data.excludedInvalidEmails > 0 && (
              <p className="mt-3 text-sm text-amber-800">
                {audience.data.excludedInvalidEmails.toLocaleString()} accounts excluded because their account email is missing or invalid.
              </p>
            )}
            {recipientGroups.length > 0 ? (
                <div className="flex items-center gap-2 mt-3 rounded-md bg-[#F1F8F3] px-4 py-3 text-[#2F7D43]">
                  <PeopleOutlinedIcon /> 
                  <p role="status" data-testid="email-recipient-count" className="min-w-0 flex-1 text-sm text-[#000000] font-bold">
                    {audience.isError ? "Recipient count unavailable" : !audienceReady ? "Loading recipients..." :
                      `${audience.data.total.toLocaleString()} ${audience.data.total === 1 ? "recipient" : "recipients"} selected`}
                  </p>
                  {audienceReady && audience.data.total > 0 && (
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      onClick={() => setRecipientsOpen(true)}
                      sx={{ flexShrink: 0, py: 0.5, backgroundColor: "#fff", borderColor: "#D0D5DD", color: "#123A1E" }}
                    >
                      View
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2 mt-3 rounded-md bg-[#F1F3F1] px-4 py-3 items-center">
                  <PeopleOutlinedIcon /> 
                  <p className="text-sm text-[#000000]">
                    No recipients selected
                  </p>
                </div>
              )

            }
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex flex-col gap-1 md:mb-6 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-3">
              <div className="flex flex-col md:flex-row md:flex-wrap md:items-baseline md:gap-3">
                <h2 className="text-lg font-semibold text-[#123A1E]">
                  2. Message
                </h2>
                <p className="text-sm text-[#8E938E]">
                  Basic formatting and images supported
                </p>
              </div>

              <p role="status" className={`flex items-center gap-1 text-xs md:text-sm ${draft.error ? "text-red-600" : "text-[#2F7D43]"}`}>
                {saveLabel.startsWith("Auto saved") && <CloudDoneOutlinedIcon sx={{ fontSize: 16 }} />}
                {saveLabel}
              </p>
            </div>

            <div inert={!canEdit}>
              <TextField
                fullWidth
                label="Subject"
                value={subject}
                onChange={(event) => draft.update({ subject: event.target.value })}
              />

              {draft.isLoaded ? (
                <EmailEditor
                  ref={editorRef}
                  value={bodyHtml}
                  initialFormat={draft.hasDraft ? "html" : "text"}
                  onChange={(bodyHtml) => draft.update({ bodyHtml })}
                />
              ) : <div className="mt-6 min-h-[400px]" />}

              {/* Image upload: inserted into the message at the cursor */}
              <div {...getRootProps({ className: "dropzone" })}>
                <input {...getInputProps()} />

                <div className="mt-4 flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-white p-4 text-center md:mt-6 md:min-h-[175px] md:gap-3 md:p-6">
                  <Image
                    src="/icons/upload-icon.svg"
                    alt="Upload icon"
                    width={16}
                    height={20}
                  />

                  {isUploadingImage || isUploadingBatch ? (
                    <p className="text-sm md:text-base">Uploading...</p>
                  ) : (
                    <p className="text-sm md:text-base">
                      <span className="text-blue-600 underline">
                        Upload
                      </span>{" "}
                      or drag and drop
                    </p>
                  )}

                  <p className="text-xs text-gray-500 md:text-sm">
                    Add images to your email · PNG, JPG or GIF (max. 3MB)
                  </p>
                </div>
              </div>

              {uploadError && (
                <p className="mt-2 text-sm text-red-600">
                  {uploadError}
                </p>
              )}
            </div>

          </section>

          {/* Email actions */}
          {!testSendOpen && !sendConfirmOpen && validationNotice}
          {/* Phones: Preview and Test send side by side, Send full width below */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-white p-3 md:flex md:flex-wrap md:items-center md:justify-end md:gap-3 md:p-4">
            <Button type="button" variant="text" startIcon={<DeleteOutlineIcon />}
              className="order-last col-span-2 md:order-none"
              disabled={!canEdit || isUploadingBatch || (!draft.hasDraft && !draft.isDirty)}
              onClick={handleDiscard}>Discard draft</Button>
            <Button
              type="button"
              variant="text"
              className={MOBILE_OUTLINED}
              onClick={() => { setNameWarningDismissed(false); setPreviewOpen(true); }}
              sx={{ color: "#123A1E", display: "flex", gap: 1}}>
              <RemoveRedEyeOutlinedIcon className="max-md:hidden!" />
              Preview
            </Button>

            <Button
              type="button"
              variant="text"
              className={MOBILE_OUTLINED}
              disabled={!canPrepareSend}
              onClick={() => {
                setTestSendNotice(null)
                setTestSendOpen(true)
              }}
              sx={{ color: "#123A1E", display: "flex", gap: 1}}>
                <EmailOutlinedIcon className="max-md:hidden!" />
              Test send
            </Button>

            <Button
              type="button"
              variant="contained"
              className="col-span-2"
              disabled={!canPrepareSend}
              onClick={() => validateSend("send")}
              sx={{display: "flex", gap: 1}}>
              <SendOutlinedIcon fontSize="small" className="max-md:hidden!" sx={{transform: "rotate(-45deg)", marginTop: "-5px"}}/>
              {isValidating && !testSendOpen ? "Checking..." : (
                <>
                  <span className="md:hidden">{sendToLabel}</span>
                  <span className="max-md:hidden">Send Email</span>
                </>
              )}
            </Button>
          </div>

          <EmailRecipientsModal
            open={recipientsOpen}
            onClose={() => setRecipientsOpen(false)}
            groups={recipientGroups}
          />

          <EmailStatusToast
            open={sendFailed}
            onClose={() => setSendFailed(false)}
            severity="error"
            title="Email failed to send"
          >
            Not every recipient was sent this email. Check the status at the top of the page.
          </EmailStatusToast>

          {/* Email preview modal */}
          <BaseModal
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            title="Preview email"
            containerClassName="md:!w-[760px]"
          >
            <div className="space-y-4">
              {missingFirstNames && !nameWarningDismissed && (
                <div role="status" className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
                  <WarningAmberRoundedIcon sx={{ fontSize: 20, color: "#B7791F", mt: "1px" }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1f2320]">Missing recipient information</p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      Some recipients don&apos;t have a first name. The email will use
                      {" "}&quot;{FIRST_NAME_FALLBACK}&quot; instead.
                    </p>
                  </div>
                  <button type="button" aria-label="Dismiss warning" className="cursor-pointer text-gray-500"
                    onClick={() => setNameWarningDismissed(true)}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </button>
                </div>
              )}

              <p className="text-sm text-gray-500">
                Previewing as an example recipient
              </p>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <p className="border-b border-gray-200 bg-[#F6FAF9] px-4 py-3 text-sm font-semibold text-[#1f2320]">
                  {fillTextTokens(subject, previewValues) || "No subject"}
                </p>

                <div className="px-4 py-4">
                  <EmailPreviewBody
                    html={fillEmailTokens(bodyHtml, previewValues, {
                      wrapValue: (value) => `<mark>${value}</mark>`,
                    })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="contained"
                  onClick={() => setPreviewOpen(false)}
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </BaseModal>

          {/* Test Send modal */}
          <BaseModal
            open={testSendOpen}
            onClose={() => { if (!isValidating) setTestSendOpen(false); }}
            title="Send Test Email"
          >
            <div className="flex flex-col gap-5">
              <p className="text-sm text-gray-600">
                Enter an email address to test your message before
                sending it to recipients. Personalization uses example values.
              </p>

              <TextField
                fullWidth
                required
                type="email"
                label="Email address"
                placeholder="example@email.com"
                value={testEmail}
                disabled={isValidating}
                onChange={(event) => {
                  setTestEmail(event.target.value);
                  setTestSendNotice(null);
                }}
              />

              {validationNotice}

              {testSendNotice && (
                <p role="status" className="rounded-md bg-[#F1F8F3] p-3 text-sm text-[#2F7D43]">
                  Test email accepted by the email provider for {testSendNotice}. Check your inbox.
                </p>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="text"
                  disabled={isValidating}
                  sx={{ color: "#123A1E" }}
                  onClick={() => setTestSendOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  disabled={!isValidTestEmail || isValidating || !canPrepareSend}
                  onClick={() => validateSend("test")}
                  sx={{
                    backgroundColor: "#2F7D43",
                    "&:hover": {
                      backgroundColor: "#246635",
                    },
                  }}
                >
                  {isValidating ? "Sending..." : "Send Test Email"}
                </Button>
              </div>
            </div>
          </BaseModal>

          {/* Send Email confirmation */}
          <BaseModal
            open={sendConfirmOpen}
            onClose={() => { if (!isValidating) setSendConfirmOpen(false); }}
            title="Send this email?"
          >
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#1f2320]">
                {validatedRecipientCount !== null
                  ? `You're about to email ${validatedRecipientCount.toLocaleString()} ${validatedRecipientCount === 1 ? "recipient" : "recipients"} in:`
                  : "You're about to email the recipients in:"}
              </p>

              <ul className="list-disc space-y-1 pl-5 text-sm font-bold text-[#1f2320]">
                {recipientGroups.map((group) => (
                  <li key={group}>
                    {groupLabels[group] ?? group}
                    {audienceReady && ` (${audience.data.groupCounts[group].toLocaleString()})`}
                  </li>
                ))}
              </ul>

              {user?.email && (
                <FormControlLabel
                  sx={{ alignItems: "flex-start", ml: "-9px", mr: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={sendCopy}
                      disabled={isValidating}
                      onChange={(event) => setSendCopy(event.target.checked)}
                    />
                  }
                  label={
                    <span className="block pt-2">
                      <span className="block text-sm text-[#1f2320]">Send me a copy</span>
                      <span className="block break-all text-xs text-gray-500">A copy goes to {user.email}</span>
                    </span>
                  }
                />
              )}

              {validationNotice}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="text"
                  disabled={isValidating}
                  onClick={() => setSendConfirmOpen(false)}
                  sx={{ color: "#123A1E" }}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  disabled={!canPrepareSend}
                  onClick={() => validateSend("send", true)}
                  sx={{
                    backgroundColor: "#2F7D43",
                    "&:hover": {
                      backgroundColor: "#246635",
                    },
                  }}
                >
                  {isValidating ? "Checking..." : "Send Email"}
                </Button>
              </div>
            </div>
          </BaseModal>
        </div>
      </div>
    </div>
  )
}
