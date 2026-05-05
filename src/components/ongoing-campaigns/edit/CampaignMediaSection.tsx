"use client";
/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { CheckCircle, Delete } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import useDeleteCampaignImage from "@/src/hooks/campaign-image-records/useDeleteCampaignImage";
import useReplaceCampaignImage from "@/src/hooks/campaign-image-records/useReplaceCampaignImage";
import { useSetMainCampaignImage } from "@/src/hooks/campaign-image-records/useSetMainPhoto";
import useUploadCampaignImage from "@/src/hooks/campaign-image-records/useUploadCampaignImage";
import BaseAlert from "@/src/components/bases/BaseAlert";
import CropImageDialogue from "@/src/components/CropImageDialogue";
import type {
  CampaignImageRecord,
  HydratedCampaignImageRecord,
} from "@/src/types/db/campaignImageRecords";
import type { EditCampaignFormData } from "@/src/types/frontend/campaignEdit";

type UploadError = {
  fileName: string;
  message: string;
};

function getFileKey(
  file:
    | Pick<HydratedCampaignImageRecord, "fileName" | "fileSize">
    | Pick<File, "name" | "size">,
) {
  if ("fileName" in file) {
    return `${file.fileName}-${file.fileSize}`;
  }

  return `${file.name}-${file.size}`;
}

function revokePreviewUrl(preview: string) {
  if (preview.startsWith("blob:")) {
    URL.revokeObjectURL(preview);
  }
}

function hasDuplicateFiles(
  nextFiles: File[],
  existingFiles: Pick<HydratedCampaignImageRecord, "fileName" | "fileSize">[],
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

function hydrateUploadedRecord(
  record: CampaignImageRecord,
  file: File,
): HydratedCampaignImageRecord {
  return {
    ...record,
    signedUrl: URL.createObjectURL(file),
    fileName: file.name,
    fileSize: file.size,
  };
}

function sortImageRecords(records: HydratedCampaignImageRecord[]) {
  return [...records].sort((left, right) => {
    if (left.is_main !== right.is_main) {
      return Number(right.is_main) - Number(left.is_main);
    }

    return left.display_order - right.display_order;
  });
}

function UploadErrorCard({
  error,
  onClear,
  errorIconFilter,
}: {
  error: UploadError;
  onClear: () => void;
  errorIconFilter: string;
}) {
  return (
    <div className="mt-2 flex items-center justify-between rounded-lg border border-[#D32F2F]/20 px-4 py-3">
      <div className="flex items-center gap-3">
        <Image
          src="/icons/upload-icon.svg"
          alt="Upload failed"
          width={20}
          height={24}
          style={{ filter: errorIconFilter }}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[#D32F2F]">
            Upload failed.
          </span>
          <span className="flex items-center text-[13px] text-[#D32F2F]">
            {error.message}
            <span className="mx-1.5 text-[10px]">&bull;</span>
            Failed
          </span>
        </div>
      </div>

      <IconButton
        size="small"
        aria-label={`Clear failed upload ${error.fileName}`}
        onClick={onClear}
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
  );
}

function UploadedAssetCard({
  fileName,
  fileSize,
  onDelete,
  deleteLabel,
}: {
  fileName: string;
  fileSize: number;
  onDelete: () => void;
  deleteLabel: string;
}) {
  return (
    <div className="mt-2 flex items-center justify-between rounded-lg border border-black/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <Image
          src="/icons/upload-icon.svg"
          alt="Upload icon"
          width={20}
          height={24}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">{fileName}</span>
          <span className="flex items-center text-[13px] text-gray-500">
            {Math.round(fileSize / 1000)}kb
            <span className="mx-1.5 text-[10px]">&bull;</span>
            Complete
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <IconButton
          size="small"
          aria-label={deleteLabel}
          onClick={onDelete}
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
  );
}

interface CampaignMediaSectionProps {
  formData: EditCampaignFormData;
  campaignId: number;
  syncImageRecords: (
    records: HydratedCampaignImageRecord[],
    options?: { syncInitialData?: boolean },
  ) => void;
}

export default function CampaignMediaSection({
  formData,
  campaignId,
  syncImageRecords,
}: CampaignMediaSectionProps) {
  const ERROR_ICON_FILTER =
    "brightness(0) saturate(100%) invert(24%) sepia(95%) saturate(2815%) hue-rotate(347deg) brightness(93%) contrast(100%)";
  const uploadCampaignImage = useUploadCampaignImage();
  const deleteCampaignImage = useDeleteCampaignImage();
  const replaceCampaignImage = useReplaceCampaignImage();
  const setMainCampaignImage = useSetMainCampaignImage(campaignId);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [supportingUploadError, setSupportingUploadError] =
    useState<UploadError | null>(null);
  const [successToast, setSuccessToast] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [cropTarget, setCropTarget] = useState<
    { type: "main" } | { type: "supporting"; recordId: number } | null
  >(null);
  const previousImageRecordsRef = useRef(formData.imageRecords);
  const mainPhoto = formData.imageRecords.find((r) => r.is_main);
  const supportingPhotos = formData.imageRecords.filter((r) => !r.is_main);
  const cropTargetRecord =
    cropTarget?.type === "main"
      ? mainPhoto
      : formData.imageRecords.find(
          (record) => record.id === cropTarget?.recordId,
        );

  useEffect(() => {
    const previousImageRecords = previousImageRecordsRef.current;
    const currentSignedUrls = new Set(
      formData.imageRecords.map((record) => record.signedUrl),
    );

    previousImageRecords.forEach((record) => {
      if (!currentSignedUrls.has(record.signedUrl)) {
        revokePreviewUrl(record.signedUrl);
      }
    });

    previousImageRecordsRef.current = formData.imageRecords;
  }, [formData.imageRecords]);

  useEffect(() => {
    return () => {
      previousImageRecordsRef.current.forEach((record) => {
        revokePreviewUrl(record.signedUrl);
      });
    };
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg", ".svg"],
    },
    multiple: false,
    maxFiles: 1,
    onDropAccepted: async (acceptedFiles) => {
      const nextFile = acceptedFiles[0];
      if (!nextFile) {
        return;
      }

      if (hasDuplicateFiles(acceptedFiles, supportingPhotos)) {
        setUploadError({
          fileName: nextFile.name,
          message: "Duplicate image",
        });
        return;
      }

      try {
        const uploadedImage = await uploadCampaignImage.mutateAsync({
          file: nextFile,
          campaignId,
          displayOrder: 0,
          isMain: true,
        });

        setUploadError(null);
        syncImageRecords(
          sortImageRecords([
            hydrateUploadedRecord(
              { ...uploadedImage, is_main: true, display_order: 0 },
              nextFile,
            ),
            ...supportingPhotos,
          ]),
        );
        setSuccessToast({
          title: "Image Saved!",
          message: "Main photo has been saved successfully.",
        });
      } catch (error) {
        console.error(error);
        setUploadError({
          fileName: nextFile.name,
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
    maxSize: 10485760,
  });

  const {
    getRootProps: getSupportingRootProps,
    getInputProps: getSupportingInputProps,
  } = useDropzone({
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg", ".svg"],
    },
    multiple: true,
    maxFiles: 5 - supportingPhotos.length,
    onDropAccepted: async (acceptedFiles) => {
      const existingFiles = mainPhoto
        ? [mainPhoto, ...supportingPhotos]
        : supportingPhotos;
      const nextFile = acceptedFiles[0];

      if (!nextFile) {
        return;
      }

      if (hasDuplicateFiles(acceptedFiles, existingFiles)) {
        setSupportingUploadError({
          fileName: nextFile.name,
          message: "Duplicate image",
        });
        return;
      }

      try {
        const uploadedFiles: HydratedCampaignImageRecord[] = [];
        const nextDisplayOrderBase =
          formData.imageRecords.reduce(
            (maxDisplayOrder, imageRecord) =>
              Math.max(maxDisplayOrder, imageRecord.display_order),
            0,
          ) + 1;

        for (const [index, file] of acceptedFiles.entries()) {
          const uploadedImage = await uploadCampaignImage.mutateAsync({
            file,
            campaignId,
            displayOrder: nextDisplayOrderBase + index,
            isMain: false,
          });

          uploadedFiles.push(hydrateUploadedRecord(uploadedImage, file));
        }

        setSupportingUploadError(null);
        syncImageRecords(
          sortImageRecords([...formData.imageRecords, ...uploadedFiles]),
        );
        setSuccessToast({
          title: "Image Saved!",
          message:
            uploadedFiles.length === 1
              ? "Supporting photo has been saved successfully."
              : "Supporting photos have been saved successfully.",
        });
      } catch (error) {
        console.error(error);
        setSupportingUploadError({
          fileName: nextFile.name,
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
    maxSize: 10485760,
    disabled: supportingPhotos.length >= 5,
  });

  const handleSetAsMain = async (record: HydratedCampaignImageRecord) => {
    try {
      await setMainCampaignImage.mutateAsync(record.id);
      syncImageRecords(
        sortImageRecords(
          formData.imageRecords.map((imageRecord) => ({
            ...imageRecord,
            is_main: imageRecord.id === record.id,
          })),
        ),
        { syncInitialData: false },
      );
      setSuccessToast({
        title: "Image Saved!",
        message: "Main photo has been updated successfully.",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMainPhoto = async (record: HydratedCampaignImageRecord) => {
    try {
      await deleteCampaignImage.mutateAsync({
        campaignId,
        storagePath: record.storage_path,
      });
      revokePreviewUrl(record.signedUrl);
      syncImageRecords(
        sortImageRecords(
          formData.imageRecords.filter((image) => image.id !== record.id),
        ),
      );
    } catch (error) {
      console.error(error);
      setUploadError({
        fileName: record.fileName || "Uploaded image",
        message: "Delete failed",
      });
    }
  };

  const handleDeleteSupportingPhoto = async (
    record: HydratedCampaignImageRecord,
  ) => {
    try {
      await deleteCampaignImage.mutateAsync({
        campaignId,
        storagePath: record.storage_path,
      });
      revokePreviewUrl(record.signedUrl);
      syncImageRecords(
        sortImageRecords(
          formData.imageRecords.filter((image) => image.id !== record.id),
        ),
      );
    } catch (error) {
      console.error(error);
      setSupportingUploadError({
        fileName: record.fileName || "Uploaded image",
        message: "Delete failed",
      });
    }
  };

  const handleCropImage = async (croppedFile: File) => {
    const targetRecord = cropTargetRecord;
    if (!targetRecord) {
      setCropTarget(null);
      return;
    }

    try {
      const replacedRecord = await replaceCampaignImage.mutateAsync({
        file: croppedFile,
        campaignId,
        oldStoragePath: targetRecord.storage_path,
      });

      const nextSignedUrl = URL.createObjectURL(croppedFile);
      revokePreviewUrl(targetRecord.signedUrl);

      syncImageRecords(
        sortImageRecords(
          formData.imageRecords.map((record) =>
            record.id === targetRecord.id
              ? {
                  ...record,
                  ...replacedRecord,
                  signedUrl: nextSignedUrl,
                  fileName: croppedFile.name,
                  fileSize: croppedFile.size,
                }
              : record,
          ),
        ),
      );

      setSuccessToast({
        title: "Image Saved!",
        message: targetRecord.is_main
          ? "Main photo has been cropped successfully."
          : "Supporting photo has been cropped successfully.",
      });
    } catch (error) {
      console.error(error);

      const nextError = {
        fileName: targetRecord.fileName || "Uploaded image",
        message: "Crop failed",
      };

      if (targetRecord.is_main) {
        setUploadError(nextError);
      } else {
        setSupportingUploadError(nextError);
      }
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Main Photo <span className="text-orange-500">*</span>
        </h2>
        <p className="text-sm">
          Upload one clear, high-quality photo that best represents your
          project. This photo will appear at the top of your campaign page.
        </p>
        {mainPhoto ? (
          <>
            <div className="relative w-full max-w-[650px] aspect-[650/358] overflow-hidden border border-gray-300">
              <Button
                variant="outlined"
                onClick={() => setCropTarget({ type: "main" })}
                sx={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  px: 1,
                  py: 0.5,
                  minWidth: 0,
                  zIndex: 1,
                }}
              >
                Crop
              </Button>
              <img
                src={mainPhoto.signedUrl}
                alt={mainPhoto.fileName || "Main campaign photo"}
                className="w-full h-full object-cover"
              />
            </div>
            <UploadedAssetCard
              fileName={mainPhoto.fileName || "Uploaded image"}
              fileSize={mainPhoto.fileSize ?? 0}
              deleteLabel={`Delete ${mainPhoto.fileName || "main photo"}`}
              onDelete={() => handleDeleteMainPhoto(mainPhoto)}
            />
          </>
        ) : uploadError ? (
          <UploadErrorCard
            error={uploadError}
            onClear={() => setUploadError(null)}
            errorIconFilter={ERROR_ICON_FILTER}
          />
        ) : (
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
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
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Supporting Photos <span className="text-orange-500">*</span>
        </h2>
        <p className="text-sm">
          You may upload up to five additional photos that help tell your
          garden&apos;s story. <br />
          *Please choose real, authentic photos of your project — for example,
          people working in the garden, harvesting food, learning together, or
          the garden space itself.
          <br /> *Do not upload logos, flyers, graphics, or AI-generated images.
          These photos should reflect real people and real places connected to
          your project.
        </p>
        {supportingUploadError && (
          <UploadErrorCard
            error={supportingUploadError}
            onClear={() => setSupportingUploadError(null)}
            errorIconFilter={ERROR_ICON_FILTER}
          />
        )}

        {supportingPhotos.length < 5 && (
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

        {supportingPhotos.map((record) => (
          <div key={record.id} className="flex flex-col gap-2">
            <div className="relative w-full max-w-[650px] aspect-[650/358] overflow-hidden border border-gray-300">
              <div className="absolute left-3 top-3 z-[1] flex items-center gap-2">
                <Button
                  variant="outlined"
                  onClick={() => handleSetAsMain(record)}
                  sx={{ px: 1, py: 0.5, minWidth: 0 }}
                >
                  Set as Main Photo
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    setCropTarget({ type: "supporting", recordId: record.id })
                  }
                  sx={{ px: 1, py: 0.5, minWidth: 0 }}
                >
                  Crop
                </Button>
              </div>
              <img
                src={record.signedUrl}
                alt={record.fileName || "Supporting campaign photo"}
                className="w-full h-full object-cover"
              />
            </div>
            <UploadedAssetCard
              fileName={record.fileName || "Uploaded image"}
              fileSize={record.fileSize ?? 0}
              deleteLabel={`Delete ${record.fileName || "supporting photo"}`}
              onDelete={() => handleDeleteSupportingPhoto(record)}
            />
          </div>
        ))}
      </div>

      <BaseAlert
        open={successToast !== null}
        onClose={() => setSuccessToast(null)}
        title={successToast?.title}
      >
        {successToast?.message}
      </BaseAlert>

      {cropTargetRecord && (
        <CropImageDialogue
          open={cropTarget !== null}
          onClose={() => setCropTarget(null)}
          imageSrc={cropTargetRecord.signedUrl}
          imageName={cropTargetRecord.fileName || "campaign-image.png"}
          onDone={handleCropImage}
        />
      )}
    </>
  );
}
