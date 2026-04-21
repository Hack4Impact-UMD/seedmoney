"use client";

import { Button } from "@mui/material";
import { CheckCircle, Delete, UploadFile } from "@mui/icons-material";
import type { HydratedCampaignImageRecord } from "@/src/types/db/campaignImageRecords";
import type { EditCampaignFormData, SetFieldValue } from "@/src/types/frontend/campaignEdit";

function UploadedAssetCard({ record, onDelete }: { record: HydratedCampaignImageRecord; onDelete?: () => void }) {
  return (
    <div className="mb-2 mt-6 mx-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <UploadFile sx={{ color: "#1976D2", fontSize: 32 }} />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">{record.fileName}</span>
          <span className="flex items-center text-[13px] text-gray-500">
            {record.fileSize ? `${Math.round(record.fileSize / 1024)}kb` : ""}
            <span className="mx-1.5 text-[10px]">&bull;</span> Complete
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Delete sx={{ opacity: 0.54, cursor: "pointer" }} onClick={onDelete} />
        <CheckCircle color="success" />
      </div>
    </div>
  );
}

interface CampaignMediaSectionProps {
  formData: EditCampaignFormData;
  campaignId: number;
  setFieldValue: SetFieldValue;
}

export default function CampaignMediaSection({ formData, campaignId, setFieldValue }: CampaignMediaSectionProps) {
  const mainPhoto = formData.imageRecords.find((r) => r.is_main);
  const supportingPhotos = formData.imageRecords.filter((r) => !r.is_main);

  const handleSetAsMain = (record: HydratedCampaignImageRecord) => {
    const updated = formData.imageRecords.map((r) => ({
      ...r,
      is_main: r.id === record.id,
    }));
    setFieldValue("imageRecords", updated);
  };

  return (
    <>
      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Main Photo <span className="text-orange-500">*</span>
        </h2>
        <p className="text-sm">
          Upload one clear, high-quality photo that best represents your project. This photo will appear at the top of your campaign page.
        </p>
        {mainPhoto ? (
          <>
            <img
              src={mainPhoto.signedUrl}
              alt="Main campaign photo"
              className="h-80 w-full rounded-lg object-cover"
            />
            <UploadedAssetCard record={mainPhoto} />
          </>
        ) : (
          <div className="h-80 w-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            No main photo uploaded
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Supporting Photos <span className="text-orange-500">*</span>
        </h2>
        <p className="text-sm">
          You may upload up to five additional photos that help tell your garden&apos;s story. <br />
          *Please choose real, authentic photos of your project — for example, people working in the garden, harvesting food, learning together, or the garden space itself.
          <br /> *Do not upload logos, flyers, graphics, or AI-generated images. These photos should reflect real people and real places connected to your project.
        </p>
        {supportingPhotos.length === 0 ? (
          <div className="h-80 w-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            No supporting photos uploaded
          </div>
        ) : (
          supportingPhotos.map((record) => (
            <div key={record.id} className="relative">
              <Button
                variant="outlined"
                onClick={() => handleSetAsMain(record)}
                sx={{ position: "absolute", top: 12, left: 12, px: 1, py: 0.5, minWidth: 0 }}
              >
                Set as Main Photo
              </Button>
              <img
                src={record.signedUrl}
                alt={record.fileName}
                className="h-80 w-full rounded-lg object-cover"
              />
              <UploadedAssetCard record={record} />
            </div>
          ))
        )}
      </div>
    </>
  );
}