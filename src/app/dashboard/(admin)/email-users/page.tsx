"use client";

import { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Navbar from "@/src/components/Navbar"
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import BaseModal from "@/src/components/bases/BaseModal";
import EmailEditor, {
  type EmailEditorHandle,
} from "@/src/components/email/EmailEditor";
import EmailPreviewBody from "@/src/components/email/EmailPreviewBody";
import useUploadEmailImage from "@/src/hooks/email/useUploadEmailImage";
import useEmailDraft from "@/src/hooks/email/useEmailDraft";
import useEmailAudience from "@/src/hooks/email/useEmailAudience";
import useEmailDelivery from "@/src/hooks/email/useEmailDelivery";
import { queueAdminEmail } from "@/src/actions/email/queue";
import { validateEmailForSend } from "@/src/actions/email/validate";
import { ADMIN_EMAIL_GROUP_LABELS, type AdminEmailGroup } from "@/src/types/db/adminEmails";
import { MAX_EMAIL_IMAGE_BYTES } from "@/src/actions/db/email-images";
import {
  EXAMPLE_TOKEN_VALUES,
  fillEmailTokens,
  fillTextTokens,
} from "@/src/components/email/emailTokens";
import Link from "next/link"
import { useRouter } from "next/navigation";

export default function EmailUsersPage() {
  const router = useRouter();
  const draft = useEmailDraft();
  const delivery = useEmailDelivery();
  const { subject, bodyHtml, recipientGroups } = draft.values;
  const audience = useEmailAudience(recipientGroups, draft.isLoaded);
  const [uploadError, setUploadError] = useState("");
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const editorRef = useRef<EmailEditorHandle>(null);
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadEmailImage();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testSendOpen, setTestSendOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSendNotice, setTestSendNotice] = useState(false);
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
    setTestSendNotice(false);
    try {
      await draft.flush();
      if (mode === "send" && confirm) {
        const identity = draft.getSavedIdentity();
        if (!identity) throw new Error("Draft not saved");
        const queued = await queueAdminEmail(identity);
        if (!queued.success) { setValidation({ key: validationKey, errors: queued.errors }); return; }
        setSendConfirmOpen(false);
        await draft.reload();
        setIsValidating(false);
        if (queued.receipt.alreadyQueued) {
          // Another tab may have queued a different version. Require an explicit resume.
          await delivery.refresh();
        } else {
          await delivery.send({ id: queued.receipt.emailId, subject, status: queued.receipt.status,
            recipientCount: queued.receipt.recipientCount });
        }
        return;
      }
      const result = await validateEmailForSend({ ...draft.values, mode, testEmail,
        competitionId: draft.hasDraft ? draft.competitionId : audience.data?.competitionId ?? null });
      if (!result.success) { setValidation({ key: validationKey, errors: result.errors }); return; }
      setValidatedRecipientCount(result.recipientCount);
      if (mode === "test") setTestSendNotice(true);
      else setSendConfirmOpen(true);
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
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#123A1E]">
                Email Users
              </h1>
              <p className="mt-2 text-gray-600">
                Send an update to a group of Seedmoney users.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                component={Link}
                href="/dashboard/email-users"
                variant="contained"
                size="small"
              >
                Compose
              </Button>

              <Button
                component={Link}
                href="/dashboard/email-users/sent-history"
                onClick={async (event) => {
                  event.preventDefault();
                  if (!canEdit || isUploadingBatch) return;
                  try {
                    await draft.flush();
                    router.push("/dashboard/email-users/sent-history");
                  } catch { /* The draft error is displayed below. */ }
                }}
                variant="outlined"
                size="small"
              >
                Sent history
              </Button>
            </div>
          </div>

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

          <section inert={!canEdit} className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-2">
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
                  <p role="status" data-testid="email-recipient-count" className="text-sm text-[#000000] font-bold">
                    {audience.isError ? "Recipient count unavailable" : !audienceReady ? "Loading recipients..." :
                      `${audience.data.total.toLocaleString()} ${audience.data.total === 1 ? "recipient" : "recipients"} selected`}
                  </p>
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

          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 className="text-lg font-semibold text-[#123A1E]">
                  2. Message
                </h2>
                <p className="text-sm text-[#8E938E]">
                  Basic formatting and images supported
                </p>
              </div>

              <p role="status" className={`text-sm ${draft.error ? "text-red-600" : "text-[#2F7D43]"}`}>
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

                <div className="mt-6 flex min-h-[175px] cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-gray-300 bg-white p-6 text-center">
                  <Image
                    src="/icons/upload-icon.svg"
                    alt="Upload icon"
                    width={16}
                    height={20}
                  />

                  {isUploadingImage || isUploadingBatch ? (
                    <p className="text-base">Uploading...</p>
                  ) : (
                    <p className="text-base">
                      <span className="text-blue-600 underline">
                        Upload
                      </span>{" "}
                      or drag and drop
                    </p>
                  )}

                  <p className="text-sm text-gray-500">
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
          <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <Button type="button" variant="text" startIcon={<DeleteOutlineIcon />}
              disabled={!canEdit || isUploadingBatch || (!draft.hasDraft && !draft.isDirty)}
              onClick={handleDiscard}>Discard draft</Button>
            <Button 
              type="button" 
              variant="text"
              onClick={() => setPreviewOpen(true)} 
              sx={{ color: "#123A1E", display: "flex", gap: 1}}>
              <RemoveRedEyeOutlinedIcon/>
              Preview
            </Button>

            <Button
              type="button"
              variant="text"
              disabled={!canPrepareSend}
              onClick={() => {
                setTestSendNotice(false)
                setTestSendOpen(true)
              }}
              sx={{ color: "#123A1E", display: "flex", gap: 1}}>
                <EmailOutlinedIcon />
              Test send
            </Button>

            <Button 
              type="button" 
              variant="contained" 
              disabled={!canPrepareSend}
              onClick={() => validateSend("send")}
              sx={{display: "flex", gap: 1}}>
              <SendOutlinedIcon fontSize="small" sx={{transform: "rotate(-45deg)", marginTop: "-5px"}}/>
              {isValidating && !testSendOpen ? "Checking..." : "Send Email"}
            </Button>
          </div>

          {/* Email preview modal */}
          <BaseModal
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            title="Preview email"
            containerClassName="md:!w-[760px]"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Previewing as an example recipient
              </p>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <p className="border-b border-gray-200 bg-[#F6FAF9] px-4 py-3 text-sm font-semibold text-[#1f2320]">
                  {fillTextTokens(subject, EXAMPLE_TOKEN_VALUES) || "No subject"}
                </p>

                <div className="px-4 py-4">
                  <EmailPreviewBody
                    html={fillEmailTokens(bodyHtml, EXAMPLE_TOKEN_VALUES, {
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
                sending it to recipients.
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
                  setTestSendNotice(false);
                }}
              />

              {validationNotice}

              {testSendNotice && (
                <p role="status" className="rounded-md bg-[#F1F8F3] p-3 text-sm text-[#2F7D43]">
                  Test send simulated for {testEmail}. No email was actually sent.
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
                  {isValidating ? "Checking..." : "Send Test Email"}
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
            <div className="flex flex-col gap-5">
              <p className="text-sm text-gray-600">
                You&apos;re about to send an email to the following groups:
              </p>

              <div className="rounded-md bg-[#F1F8F3] p-4">
                <p className="font-semibold text-[#123A1E]">
                  {recipientGroups.map((group) => groupLabels[group] ?? group).join(", ")}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  {validatedRecipientCount !== null ? `${validatedRecipientCount.toLocaleString()} unique recipients` : "Recipient count unavailable"}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Subject: {subject}
                </p>
              </div>

              {validationNotice}

              <p className="text-sm text-gray-500">
                Please review your recipients and message before confirming.
              </p>

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
                  {isValidating ? "Checking..." : "Confirm and send"}
                </Button>
              </div>
            </div>
          </BaseModal>
        </div>
      </div>
    </div>
  )
}
