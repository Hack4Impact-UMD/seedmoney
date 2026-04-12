"use client";
import Image from "next/image";
import { Button, IconButton } from "@mui/material";
import TextField from "@mui/material/TextField";
import { CheckCircle, Delete } from "@mui/icons-material";
import Link from "next/link";
import {
  useApplicationForm,
  useLastSaved,
} from "@/src/components/application/ApplicationFormProvider";
import useReadQuestion from "@/src/hooks/questions/useReadQuestion";
import { notFound, useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useRef, useState } from "react";
import useSaveDraftCampaign from "@/src/hooks/campaigns/useSaveDraftCampaign";
import useUpsertAnswer from "@/src/hooks/answers/useUpsertAnswer";
import useUploadCampaignImage from "@/src/hooks/campaign-image-records/useUploadCampaignImage";
import useDeleteCampaignImage from "@/src/hooks/campaign-image-records/useDeleteCampaignImage";

type PreviewFile = {
  name: string;
  size: number;
  preview: string;
  storagePath?: string;
};
type UploadError = {
  fileName: string;
  message: string;
};

function getFileKey(
  file: Pick<PreviewFile, "name" | "size"> | Pick<File, "name" | "size">,
) {
  return `${file.name}-${file.size}`;
}

function buildPreviewFiles(files: File[]): PreviewFile[] {
  return files.map((file) => ({
    name: file.name,
    size: file.size,
    preview: URL.createObjectURL(file),
  }));
}

function revokePreviewUrl(preview: string) {
  if (preview.startsWith("blob:")) {
    URL.revokeObjectURL(preview);
  }
}

function hasDuplicateFiles(
  nextFiles: File[],
  existingFiles: Pick<PreviewFile, "name" | "size">[],
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
  const router = useRouter();
  const { setLastSaved } = useLastSaved();
  const { draftCampaignId, saveDraftCampaign } = useSaveDraftCampaign();
  const upsertAnswer = useUpsertAnswer();
  const uploadCampaignImage = useUploadCampaignImage();
  const deleteCampaignImage = useDeleteCampaignImage();
  const values = form.state.values;
  const { data: question1, isLoading: isLoadingQuestion1 } = useReadQuestion(1);
  const { data: question2, isLoading: isLoadingQuestion2 } = useReadQuestion(2);
  const { data: question3, isLoading: isLoadingQuestion3 } = useReadQuestion(3);
  const { data: question4, isLoading: isLoadingQuestion4 } = useReadQuestion(4);
  const [uploaded, setUploaded] = useState(
    () => values.mainPhoto.trim().length > 0,
  );
  const [files, setFiles] = useState<PreviewFile[]>(() =>
    values.mainPhoto
      ? [
          {
            name: values.mainPhotoName || "Uploaded image",
            size: values.mainPhotoSize,
            preview: values.mainPhoto,
            storagePath: values.mainPhotoStoragePath,
          },
        ]
      : [],
  );
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [supportingFiles, setSupportingFiles] = useState<PreviewFile[]>(() =>
    values.supportingPhotos.map((preview, index) => ({
      name: values.supportingPhotoNames[index] || "Uploaded image",
      size: values.supportingPhotoSizes[index] ?? 0,
      preview,
      storagePath: values.supportingPhotoStoragePaths[index],
    })),
  );
  const [supportingUploadError, setSupportingUploadError] =
    useState<UploadError | null>(null);
  const storyAnswersRef = useRef({
    1: values.storyLocationAndAudience,
    2: values.storyChallenge,
    3: values.storySeasonActivity,
    4: values.storyCampaignImpact,
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg", ".svg"],
    },
    multiple: false,
    maxFiles: 1,
    onDrop: (file) => {
      console.log(file);
    },
    onDropAccepted: async (acceptedFiles) => {
      if (hasDuplicateFiles(acceptedFiles, supportingFiles)) {
        setFiles([]);
        setUploaded(false);
        setUploadError({
          fileName: acceptedFiles[0].name,
          message: "Duplicate image",
        });
        form.setFieldValue("mainPhoto", "");
        form.setFieldValue("mainPhotoStoragePath", "");
        form.setFieldValue("mainPhotoName", "");
        form.setFieldValue("mainPhotoSize", 0);
        return;
      }

      try {
        const campaignId = draftCampaignId ?? (await saveDraftCampaign({}));
        const nextFiles = buildPreviewFiles(acceptedFiles);
        const existingMainStoragePath = files[0]?.storagePath;

        if (existingMainStoragePath) {
          await deleteCampaignImage.mutateAsync({
            campaignId,
            storagePath: existingMainStoragePath,
          });
        }

        const uploadedImage = await uploadCampaignImage.mutateAsync({
          file: acceptedFiles[0],
          campaignId,
          displayOrder: 0,
          isMain: true,
        });

        files.forEach((file) => revokePreviewUrl(file.preview));
        nextFiles[0].storagePath = uploadedImage.storage_path;
        setUploadError(null);
        setUploaded(true);
        setFiles(nextFiles);
        form.setFieldValue("mainPhoto", nextFiles[0]?.preview ?? "");
        form.setFieldValue(
          "mainPhotoStoragePath",
          uploadedImage.storage_path ?? "",
        );
        form.setFieldValue("mainPhotoName", nextFiles[0]?.name ?? "");
        form.setFieldValue("mainPhotoSize", nextFiles[0]?.size ?? 0);
        setLastSaved(new Date().toLocaleTimeString());
      } catch (error) {
        console.error(error);
        setUploadError({
          fileName: acceptedFiles[0].name,
          message: "Upload failed",
        });
      }
    },
    onDropRejected: (fileRejections) => {
      const firstRejection = fileRejections[0];
      if (!firstRejection) {
        return;
      }

      const isFileTooLarge = firstRejection.errors.some(
        (error) => error.code === "file-too-large",
      );

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
    onDropAccepted: async (acceptedFiles) => {
      if (hasDuplicateFiles(acceptedFiles, [...files, ...supportingFiles])) {
        setSupportingUploadError({
          fileName: acceptedFiles[0].name,
          message: "Duplicate image",
        });
        return;
      }

      try {
        const campaignId = draftCampaignId ?? (await saveDraftCampaign({}));
        const nextFiles = buildPreviewFiles(acceptedFiles);
        const uploadedFiles: PreviewFile[] = [];
        const nextDisplayOrderBase = Date.now();

        for (const [index, file] of acceptedFiles.entries()) {
          const uploadedImage = await uploadCampaignImage.mutateAsync({
            file,
            campaignId,
            displayOrder: nextDisplayOrderBase + index,
            isMain: false,
          });

          uploadedFiles.push({
            ...nextFiles[index],
            storagePath: uploadedImage.storage_path,
          });
        }

        setSupportingUploadError(null);
        const updatedFiles = [...supportingFiles, ...uploadedFiles];
        setSupportingFiles(updatedFiles);
        form.setFieldValue(
          "supportingPhotos",
          updatedFiles.map((file) => file.preview),
        );
        form.setFieldValue(
          "supportingPhotoStoragePaths",
          updatedFiles.map((file) => file.storagePath ?? ""),
        );
        form.setFieldValue(
          "supportingPhotoNames",
          updatedFiles.map((file) => file.name),
        );
        form.setFieldValue(
          "supportingPhotoSizes",
          updatedFiles.map((file) => file.size),
        );
        setLastSaved(new Date().toLocaleTimeString());
      } catch (error) {
        console.error(error);
        setSupportingUploadError({
          fileName: acceptedFiles[0].name,
          message: "Upload failed",
        });
      }
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
        />
      </div>
    </div>
  ));

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

  const handleDeleteImage = async (fileToDelete: PreviewFile) => {
    if (fileToDelete.storagePath && draftCampaignId) {
      await deleteCampaignImage.mutateAsync({
        campaignId: draftCampaignId,
        storagePath: fileToDelete.storagePath,
      });
    }

    setFiles((prevFiles) => {
      const remainingFiles = prevFiles.filter((file) => {
        if (file.preview === fileToDelete.preview) {
          revokePreviewUrl(file.preview);
          return false;
        }

        return true;
      });

      setUploaded(remainingFiles.length > 0);
      return remainingFiles;
    });
    form.setFieldValue("mainPhoto", "");
    form.setFieldValue("mainPhotoStoragePath", "");
    form.setFieldValue("mainPhotoName", "");
    form.setFieldValue("mainPhotoSize", 0);
    setLastSaved(new Date().toLocaleTimeString());
  };

  const handleClearUploadError = () => {
    setUploadError(null);
  };

  const handleDeleteSupportingImage = async (fileToDelete: PreviewFile) => {
    if (fileToDelete.storagePath && draftCampaignId) {
      await deleteCampaignImage.mutateAsync({
        campaignId: draftCampaignId,
        storagePath: fileToDelete.storagePath,
      });
    }

    const remainingFiles = supportingFiles.filter((file) => {
      if (file.preview === fileToDelete.preview) {
        revokePreviewUrl(file.preview);
        return false;
      }

      return true;
    });

    setSupportingFiles(remainingFiles);
    form.setFieldValue(
      "supportingPhotos",
      remainingFiles.map((file) => file.preview),
    );
    form.setFieldValue(
      "supportingPhotoStoragePaths",
      remainingFiles.map((file) => file.storagePath ?? ""),
    );
    form.setFieldValue(
      "supportingPhotoNames",
      remainingFiles.map((file) => file.name),
    );
    form.setFieldValue(
      "supportingPhotoSizes",
      remainingFiles.map((file) => file.size),
    );
    setLastSaved(new Date().toLocaleTimeString());
  };

  const handleClearSupportingUploadError = () => {
    setSupportingUploadError(null);
  };

  const saveStoryAnswer = async (questionId: number, finalAnswer: string) => {
    if (storyAnswersRef.current[questionId as 1 | 2 | 3 | 4] === finalAnswer) {
      return;
    }

    const campaignId = draftCampaignId ?? (await saveDraftCampaign({}));

    await upsertAnswer.mutateAsync({
      campaignId,
      questionId,
      finalAnswer,
    });
    storyAnswersRef.current[questionId as 1 | 2 | 3 | 4] = finalAnswer;
    setLastSaved(new Date().toLocaleTimeString());
  };

  const saveGardenStoryDraft = async () => {
    await saveStoryAnswer(1, form.state.values.storyLocationAndAudience);
    await saveStoryAnswer(2, form.state.values.storyChallenge);
    await saveStoryAnswer(3, form.state.values.storySeasonActivity);
    await saveStoryAnswer(4, form.state.values.storyCampaignImpact);
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
              onBlur={async (e) => {
                field.handleBlur();
                await saveStoryAnswer(1, e.target.value);
              }}
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
              onBlur={async (e) => {
                field.handleBlur();
                await saveStoryAnswer(2, e.target.value);
              }}
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
              onBlur={async (e) => {
                field.handleBlur();
                await saveStoryAnswer(3, e.target.value);
              }}
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
              onBlur={async (e) => {
                field.handleBlur();
                await saveStoryAnswer(4, e.target.value);
              }}
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
                onClick={() => handleDeleteImage(file)}
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
          <div
            key={`${file.name}-${file.size}`}
            className="flex flex-col gap-2"
          >
            <div className="w-[650px] h-[358px] overflow-hidden border border-gray-300">
              <img
                src={file.preview}
                alt={file.name}
                className="w-full h-full object-cover"
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
                  onClick={() => handleDeleteSupportingImage(file)}
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
          component="button"
          variant="contained"
          size="medium"
          onClick={async () => {
            await saveGardenStoryDraft();
            router.push("/apply/contact");
          }}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
