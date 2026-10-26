"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Navbar from "@/src/components/Navbar"
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import BaseModal from "@/src/components/bases/BaseModal";
import Link from "next/link"
import { useRouter } from "next/navigation";

export default function EmailUsersPage() {
  const router = useRouter();
  const [recipientGroups, setRecipientGroups] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testSendOpen, setTestSendOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSendNotice, setTestSendNotice] = useState(false);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sendNotice, setSendNotice] = useState(false);

  const isValidTestEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim());

  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
    },
    multiple: true,
    maxSize: 3 * 1024 * 1024,
  
    onDropAccepted: (files) => {
      setSelectedImages((prev) => [...prev, ...files]);
      setUploadError("");
    },
  
    onDropRejected: () => {
      setUploadError("Only PNG, JPG or GIF images under 3MB are allowed.");
    },
  });

  const groupLabels: Record<string, string> = {
    all: "All Users",
    applicants: "Applicants",
    approved: "Approved Campaigns",
  };

  const handleDiscard = () => {
    setRecipientGroups([]);
    setSubject("");
    setSelectedImages([]);
    setUploadError("");
  };

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
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  px: 2,
                  py: 0.75,
                }}
              >
                Compose
              </Button>

              <Button
                component={Link}
                href="/dashboard/email-users/sent-history"
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  px: 2,
                  py: 0.75,
                }}
              >
                Sent history (12)
              </Button>
            </div>
          </div>

          <section className="rounded-xl border border-gray-200 bg-white p-6">
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
                      setRecipientGroups((prev) =>
                        prev.filter((item) => item !== group)
                      )
                    }
                  />
                ))}
              </div>
            )}

            <FormControl fullWidth>
              <InputLabel id="recipient-groups-label">
                Recipient groups
              </InputLabel>

              <Select<string[]>
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

                  setRecipientGroups(
                    typeof value === "string" ? value.split(",") : value
                  );
                }}
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="applicants">Applicants</MenuItem>
                <MenuItem value="approved">Approved Campaigns</MenuItem>
              </Select>
            </FormControl>
            
            {recipientGroups.length > 0 ? (
                <div className="flex items-center gap-2 mt-3 rounded-md bg-[#F1F8F3] px-4 py-3 text-[#2F7D43]">
                  <PeopleOutlinedIcon /> 
                  <p className="text-sm text-[#000000] font-bold">
                    {/* change to display list count */}
                    Recipient selection is for preview
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

              <p className="text-sm text-[#2F7D43]">
                Draft preview (not saved)
              </p>
            </div>

            <TextField
              fullWidth
              label="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />

            {/* TODO: Import email editor component or expand here */}
            <div className="mt-6 overflow-hidden rounded-xl border border-gray-300">
              <div className="flex gap-6 border-b border-gray-300 bg-[#F6FAF9] px-4 py-3">
                <span className="font-semibold text-[#123A1E]">Text</span>
                <span className="text-gray-500">HTML</span>
              </div>

              <div className="flex min-h-[400px] items-center justify-center p-6 text-center text-gray-400">
                Email editor placeholder
              </div>
            </div>

            {/* Image upload*/}
            {/* TODO: Connect to backend to store images and attached the images to the email */}
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />

              <div className="mt-6 flex min-h-[175px] cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-gray-300 bg-white p-6 text-center">
                <Image
                  src="/icons/upload-icon.svg"
                  alt="Upload icon"
                  width={16}
                  height={20}
                />

                <p className="text-base">
                  <span className="text-blue-600 underline">
                    Upload
                  </span>{" "}
                  or drag and drop
                </p>

                <p className="text-sm text-gray-500">
                  Add images to your email · PNG, JPG or GIF (max. 3MB)
                </p>
              </div>
            </div>

            {selectedImages.map((file, index) => (
              <div key={`${file.name}-${index}`} className="mt-2 flex items-center gap-3">
                <p className="text-sm text-gray-600">
                  {file.name} · {(file.size / 1024).toFixed(0)} KB
                </p>

                <button
                  type="button"
                  className="text-sm text-green-700"
                  onClick={() =>
                    setSelectedImages((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}

            {uploadError && (
              <p className="mt-2 text-sm text-red-600">
                {uploadError}
              </p>
            )}

          </section>

          {/* Email actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
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
              disabled={recipientGroups.length === 0 || !subject.trim()}
              onClick={() => {
                setSendNotice(false);
                setSendConfirmOpen(true);
              }}
              sx={{display: "flex", gap: 1}}>
              <SendOutlinedIcon fontSize="small" sx={{transform: "rotate(-45deg)", marginTop: "-5px"}}/>
              Send Email
            </Button>
          </div>

          {/* Email preview modal */}
          <BaseModal
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            title="Email Preview"
            containerClassName="md:!w-[760px]"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                {/* TODO: show a display of the email */}
                Preview of your email before sending.
              </p>

              <div className="rounded-md border border-gray-200 p-4">
                <p className="text-sm text-gray-600">
                  To: {recipientGroups.length > 0
                    ? recipientGroups.join(", ")
                    : "No recipients selected"}
                </p>

                <p className="mt-2 font-semibold text-[#123A1E]">
                  {subject || "No subject"}
                </p>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-gray-400">
                    Email editor placeholder
                  </p>
                </div>

                {selectedImages.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <p className="mb-2 font-medium">Attachments</p>

                    {selectedImages.map((file, index) => (
                      <p key={`${file.name}-${index}`} className="text-sm text-gray-600">
                        {file.name}
                      </p>
                    ))}
                  </div>
                )}
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
            onClose={() => setTestSendOpen(false)}
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
                onChange={(event) => {
                  setTestEmail(event.target.value);
                  setTestSendNotice(false);
                }}
              />

              {testSendNotice && (
                <p role="status" className="rounded-md bg-[#F1F8F3] p-3 text-sm text-[#2F7D43]">
                  Test send simulated for {testEmail}. No email was actually sent.
                </p>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="text"
                  sx={{ color: "#123A1E" }}
                  onClick={() => setTestSendOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  disabled={!isValidTestEmail}
                  onClick={() => setTestSendNotice(true)}
                  sx={{
                    backgroundColor: "#2F7D43",
                    "&:hover": {
                      backgroundColor: "#246635",
                    },
                  }}
                >
                  Send Test Email
                </Button>
              </div>
            </div>
          </BaseModal>

          {/* Send Email confirmation */}
          <BaseModal
            open={sendConfirmOpen}
            onClose={() => setSendConfirmOpen(false)}
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
                  Subject: {subject}
                </p>
              </div>

              <p className="text-sm text-gray-500">
                Please review your recipients and message before confirming.
                This is a frontend demonstration; no email will be sent.
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="text"
                  onClick={() => setSendConfirmOpen(false)}
                  sx={{ color: "#123A1E" }}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  onClick={() => {
                    setSendConfirmOpen(false);
                    router.push("/dashboard/email-users/sent-history")
                  }}
                  sx={{
                    backgroundColor: "#2F7D43",
                    "&:hover": {
                      backgroundColor: "#246635",
                    },
                  }}
                >
                  Confirm (Demo)
                </Button>
              </div>
            </div>
          </BaseModal>
        </div>
      </div>
    </div>
  )
}