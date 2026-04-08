"use client";
import Image from "next/image";
import { Button, IconButton } from "@mui/material";
import TextField from "@mui/material/TextField";
import { CheckCircle, Delete } from "@mui/icons-material";
import Link from "next/link";
import { useApplicationForm } from "@/src/components/application/ApplicationFormProvider";
import useUploadCampaignImage from "@/src/hooks/campaign-image-records/useUploadCampaignImage";
import useReadQuestion from "@/src/hooks/questions/useReadQuestion";
import { notFound } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useState, useEffect } from "react";

type PreviewFile = File & { preview: string };
type UploadError = {
  fileName: string;
  message: string;
};

function getFileKey(file: Pick<File, "name" | "size" | "lastModified">) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function buildPreviewFiles(files: File[]): PreviewFile[] {
  return files.map((file) =>
    Object.assign(file, {
      preview: URL.createObjectURL(file),
    }),
  );
}

function hasDuplicateFiles(
  nextFiles: File[],
  existingFiles: Pick<File, "name" | "size" | "lastModified">[],
) {
  const seen = new Set(existingFiles.map(getFileKey));

  for (const file of nextFiles) {
    const fileKey = getFileKey(file);
    if (seen.has(fileKey)) {
      return true;
    }

    seen.add(fileKey);
  }

  return false;
}

export default function GardenStoryStep() {
  const ERROR_ICON_FILTER =
    "brightness(0) saturate(100%) invert(24%) sepia(95%) saturate(2815%) hue-rotate(347deg) brightness(93%) contrast(100%)";
  const form = useApplicationForm();
  const { data: question1, isLoading: isLoadingQuestion1 } = useReadQuestion(1);
  const { data: question2, isLoading: isLoadingQuestion2 } = useReadQuestion(2);
  const { data: question3, isLoading: isLoadingQuestion3 } = useReadQuestion(3);
  const { data: question4, isLoading: isLoadingQuestion4 } = useReadQuestion(4);
  const [uploaded, setUploaded] = useState(false);
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [supportingFiles, setSupportingFiles] = useState<PreviewFile[]>([]);
  const [supportingUploadError, setSupportingUploadError] =
    useState<UploadError | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg", ".svg"],
    },
    multiple: false,
    maxFiles: 1,
    onDrop: (file) => {
      console.log(file);
    },
    onDropAccepted: (acceptedFiles) => {
      if (hasDuplicateFiles(acceptedFiles, supportingFiles)) {
        setFiles([]);
        setUploaded(false);
        setUploadError({
          fileName: acceptedFiles[0].name,
          message: "Duplicate image",
        });
        return;
      }

      setUploadError(null);
      setUploaded(true);
      setFiles(buildPreviewFiles(acceptedFiles));
    },
    onDropRejected: (fileRejections) => {
      const firstRejection = fileRejections[0];
      if (!firstRejection) {
        return;
      }

      const isFileTooLarge = firstRejection.errors.some(
        (error) => error.code === "file-too-large",
      );

      setFiles([]);
      setUploaded(false);
      setUploadError({
        fileName: firstRejection.file.name,
        message: isFileTooLarge ? "File too large" : "Upload failed",
      });
    },
    maxSize: 3000000,
  });

  const {
    getRootProps: getSupportingRootProps,
    getInputProps: getSupportingInputProps,
  } = useDropzone({
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg", ".svg"],
    },
    multiple: true,
    maxFiles: 5 - supportingFiles.length,
    onDropAccepted: (acceptedFiles) => {
      if (hasDuplicateFiles(acceptedFiles, [...files, ...supportingFiles])) {
        setSupportingUploadError({
          fileName: acceptedFiles[0].name,
          message: "Duplicate image",
        });
        return;
      }

      setSupportingUploadError(null);
      setSupportingFiles((prevFiles) => [
        ...prevFiles,
        ...buildPreviewFiles(acceptedFiles),
      ]);
    },
    onDropRejected: (fileRejections) => {
      const firstRejection = fileRejections[0];
      if (!firstRejection) {
        return;
      }

      const isFileTooLarge = firstRejection.errors.some(
        (error) => error.code === "file-too-large",
      );

      setSupportingUploadError({
        fileName: firstRejection.file.name,
        message: isFileTooLarge ? "File too large" : "Upload failed",
      });
    },
    maxSize: 3000000,
    disabled: supportingFiles.length >= 5,
  });

  const imagePreviews = files.map((file) => (
    <div key={file.name}>
      <div className="w-[650px] h-[358px] overflow-hidden border border-gray-300">
        <img
          src={file.preview}
          alt={file.name}
          className="w-full h-full object-cover"
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
    </div>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  useEffect(() => {
    return () =>
      supportingFiles.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [supportingFiles]);

  const isLoading =
    isLoadingQuestion1 ||
    isLoadingQuestion2 ||
    isLoadingQuestion3 ||
    isLoadingQuestion4;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!question1 || !question2 || !question3 || !question4) {
    notFound();
  }

  const handleDeleteImage = (fileName: string) => {
    setFiles((prevFiles) => {
      const remainingFiles = prevFiles.filter((file) => {
        if (file.name === fileName) {
          URL.revokeObjectURL(file.preview);
          return false;
        }

        return true;
      });

      setUploaded(remainingFiles.length > 0);
      return remainingFiles;
    });
  };

  const handleClearUploadError = () => {
    setUploadError(null);
  };

  const handleDeleteSupportingImage = (fileName: string) => {
    setSupportingFiles((prevFiles) =>
      prevFiles.filter((file) => {
        if (file.name === fileName) {
          URL.revokeObjectURL(file.preview);
          return false;
        }

        return true;
      }),
    );
  };

  const handleClearSupportingUploadError = () => {
    setSupportingUploadError(null);
  };

  return (
    <div className="flex flex-col gap-6 w-[700px] m-15">
      {/* Garden Story */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Garden Story <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">2-3 sentences each</p>

        <form.Field name="storyLocationAndAudience">
          {(field) => (
            <TextField
              variant="standard"
              label={question1.question}
              fullWidth
              name="storyLocationAndAudience"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="storyChallenge">
          {(field) => (
            <TextField
              variant="standard"
              label={question2.question}
              fullWidth
              name="storyChallenge"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="storySeasonActivity">
          {(field) => (
            <TextField
              variant="standard"
              label={question3.question}
              fullWidth
              name="storySeasonActivity"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="storyCampaignImpact">
          {(field) => (
            <TextField
              variant="standard"
              label={question4.question}
              fullWidth
              name="storyCampaignImpact"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>
      </div>

      {/* Main Photo */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Main Photo <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          Upload one clear, high-quality photo that best represents your
          project. This photo will appear at the top of your campaign page.
        </p>
        {uploaded ? (
          imagePreviews
        ) : uploadError ? (
          <div className="mt-2 flex items-center justify-between rounded-lg border border-[#D32F2F]/20 px-4 py-3">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/upload-icon.svg"
                alt="Upload failed"
                width={20}
                height={24}
                style={{ filter: ERROR_ICON_FILTER }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#D32F2F]">
                  Upload failed.
                </span>
                <span className="flex items-center text-[13px] text-[#D32F2F]">
                  {uploadError.message}
                  <span className="mx-1.5 text-[10px]">&bull;</span>
                  Failed
                </span>
              </div>
            </div>

            <IconButton
              size="small"
              aria-label={`Clear failed upload ${uploadError.fileName}`}
              onClick={handleClearUploadError}
              sx={{
                p: 0,
                color: "rgba(0, 0, 0, 0.54)",
                cursor: "pointer",
                "& .MuiSvgIcon-root": {
                  pointerEvents: "none",
                },
              }}
            >
              <Delete />
            </IconButton>
          </div>
        ) : (
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <div className="border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-10 gap-3 text-center">
              {/* Upload Icon */}
              <Image
                src="/icons/upload-icon.svg"
                alt="Upload icon"
                width={16}
                height={20}
              />

              <p className="text-sm">
                <span className="text-blue-600 cursor-pointer hover:underline">
                  Link
                </span>{" "}
                or drag and drop
              </p>

              <p className="text-xs text-gray-500">
                SVG, PNG, JPG or GIF (max. 3MB)
              </p>
            </div>
          </div>
        )}

        {files.map((file) => (
          <div
            key={`${file.name}-${file.size}`}
            className="mt-2 flex items-center justify-between rounded-lg border border-black/10 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/icons/upload-icon.svg"
                alt="Upload icon"
                width={20}
                height={24}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {file.name}
                </span>
                <span className="flex items-center text-[13px] text-gray-500">
                  {Math.round(file.size / 1000)}kb
                  <span className="mx-1.5 text-[10px]">&bull;</span>
                  Complete
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <IconButton
                size="small"
                aria-label={`Delete ${file.name}`}
                onClick={() => handleDeleteImage(file.name)}
                sx={{
                  p: 0,
                  color: "rgba(0, 0, 0, 0.54)",
                  cursor: "pointer",
                  "& .MuiSvgIcon-root": {
                    pointerEvents: "none",
                  },
                }}
              >
                <Delete />
              </IconButton>
              <CheckCircle color="success" />
            </div>
          </div>
        ))}
      </div>

      {/* Supporting Photos */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">Supporting Photos</h2>

        <p className="text-sm text-gray-600">
          You may upload up to five additional photos that help tell your
          garden’s story.
          <br />
          *Please choose real, authentic photos of your project and do not
          upload logos, flyers, graphics, or AI-generated images.
        </p>

        {supportingUploadError && (
          <div className="mt-2 flex items-center justify-between rounded-lg border border-[#D32F2F]/20 px-4 py-3">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/upload-icon.svg"
                alt="Upload failed"
                width={20}
                height={24}
                style={{ filter: ERROR_ICON_FILTER }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#D32F2F]">
                  Upload failed.
                </span>
                <span className="flex items-center text-[13px] text-[#D32F2F]">
                  {supportingUploadError.message}
                  <span className="mx-1.5 text-[10px]">&bull;</span>
                  Failed
                </span>
              </div>
            </div>

            <IconButton
              size="small"
              aria-label={`Clear failed upload ${supportingUploadError.fileName}`}
              onClick={handleClearSupportingUploadError}
              sx={{
                p: 0,
                color: "rgba(0, 0, 0, 0.54)",
                cursor: "pointer",
                "& .MuiSvgIcon-root": {
                  pointerEvents: "none",
                },
              }}
            >
              <Delete />
            </IconButton>
          </div>
        )}

        {supportingFiles.length < 5 && (
          <div {...getSupportingRootProps({ className: "dropzone" })}>
            <input {...getSupportingInputProps()} />
            <div className="border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-10 gap-3 text-center">
              <Image
                src="/icons/upload-icon.svg"
                alt="Upload icon"
                width={16}
                height={20}
              />

              <p className="text-sm">
                <span className="text-blue-600 cursor-pointer hover:underline">
                  Link
                </span>{" "}
                or drag and drop
              </p>

              <p className="text-xs text-gray-500">
                SVG, PNG, JPG or GIF (max. 3MB)
              </p>
            </div>
          </div>
        )}

        {supportingFiles.map((file) => (
          <div key={`${file.name}-${file.size}`} className="flex flex-col gap-2">
            <div className="w-[650px] h-[358px] overflow-hidden border border-gray-300">
              <img
                src={file.preview}
                alt={file.name}
                className="w-full h-full object-cover"
                onLoad={() => {
                  URL.revokeObjectURL(file.preview);
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between rounded-lg border border-black/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/icons/upload-icon.svg"
                  alt="Upload icon"
                  width={20}
                  height={24}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800">
                    {file.name}
                  </span>
                  <span className="flex items-center text-[13px] text-gray-500">
                    {Math.round(file.size / 1000)}kb
                    <span className="mx-1.5 text-[10px]">&bull;</span>
                    Complete
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <IconButton
                  size="small"
                  aria-label={`Delete ${file.name}`}
                  onClick={() => handleDeleteSupportingImage(file.name)}
                  sx={{
                    p: 0,
                    color: "rgba(0, 0, 0, 0.54)",
                    cursor: "pointer",
                    "& .MuiSvgIcon-root": {
                      pointerEvents: "none",
                    },
                  }}
                >
                  <Delete />
                </IconButton>
                <CheckCircle color="success" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2">
        <Button
          component={Link}
          href="/apply/garden"
          variant="outlined"
          size="medium"
        >
          Previous Step
        </Button>

        <Button
          component={Link}
          href="/apply/contact"
          variant="contained"
          size="medium"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
