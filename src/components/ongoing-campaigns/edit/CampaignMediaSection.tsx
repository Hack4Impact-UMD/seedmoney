"use client";

import Image from "next/image";
import { Button } from "@mui/material";
import { CheckCircle, Delete, UploadFile } from "@mui/icons-material";

function UploadedAssetCard() {
  return (
    <div className="mb-2 mt-6 mx-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <UploadFile sx={{ color: "#1976D2", fontSize: 32 }} />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">
            document_file_name.pdf
          </span>
          <span className="flex items-center text-[13px] text-gray-500">
            100kb <span className="mx-1.5 text-[10px]">&bull;</span> Complete
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Delete sx={{ opacity: 0.54, cursor: "pointer" }} />
        <CheckCircle color="success" />
      </div>
    </div>
  );
}

export default function CampaignMediaSection() {
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
        <Image
          src="/seedmoneyTeam.png"
          alt="Seed Money Team"
          width={1600}
          height={900}
          className="h-80 w-full rounded-lg object-cover"
        />
        <UploadedAssetCard />
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
          <br /> *Do not upload logos, flyers, graphics, or AI-generated
          images. These photos should reflect real people and real places
          connected to your project.
        </p>
        <div className="relative">
          <Button
            variant="outlined"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              px: 1,
              py: 0.5,
              minWidth: 0,
            }}
          >
            Set as Main Photo
          </Button>
          <Image
            src="/seedmoneyTeam.png"
            alt="Seed Money Team"
            width={1600}
            height={900}
            className="h-80 w-full rounded-lg object-cover"
          />
          <UploadedAssetCard />
        </div>
      </div>
    </>
  );
}
