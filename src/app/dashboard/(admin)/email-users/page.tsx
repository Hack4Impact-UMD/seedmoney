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

export default function EmailUsersPage() {
  const [recipientGroups, setRecipientGroups] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");

  
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
          <div className="hidden w-full md:block">
            <h1 className="text-4xl font-bold text-[#123A1E]">Email Users</h1>
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
            <Button variant="text" sx={{ color: "#123A1E", display: "flex", gap: 1}}>
              <RemoveRedEyeOutlinedIcon/>
              Preview
            </Button>

            <Button
              variant="text"
              sx={{ color: "#123A1E", display: "flex", gap: 1}}>
                <EmailOutlinedIcon />
              Test send
            </Button>

            <Button variant="contained" sx={{display: "flex", gap: 1}}>
              <SendOutlinedIcon fontSize="small" sx={{transform: "rotate(-45deg)", marginTop: "-5px"}}/>
              Send Email
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}