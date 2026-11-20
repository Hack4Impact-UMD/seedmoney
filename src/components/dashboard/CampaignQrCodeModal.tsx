"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import BaseModal from "@/src/components/bases/BaseModal";

type CampaignQrCodeModalProps = {
  open: boolean;
  onClose: () => void;
  onDownloaded: () => void;
  campaignName: string;
  campaignUrl: string;
};

const DOWNLOAD_SIZE = 1024;

const toFileName = (name: string) => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "campaign"}-qr-code.png`;
};

export default function CampaignQrCodeModal({
  open,
  onClose,
  onDownloaded,
  campaignName,
  campaignUrl,
}: CampaignQrCodeModalProps) {
  const downloadCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    const canvas = downloadCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = toFileName(campaignName);
    link.click();

    onDownloaded();
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      containerClassName="!w-[calc(100%_-_2rem)] sm:!w-[90%] max-w-[360px] !min-h-0 items-center text-center !p-5 sm:!p-6"
    >
      <IconButton
        aria-label="Close"
        size="medium"
        onClick={onClose}
        className="!absolute right-2 top-2 !text-[#666666]"
      >
        <Close fontSize="small" />
      </IconButton>

      <h2 className="mt-2 max-w-full break-words text-xl font-semibold text-[#123A1E]">
        {campaignName}
      </h2>
      <p className="mt-1 text-sm text-[#666666]">Campaign QR Code</p>
      <p className="mt-4 text-sm text-[#666666]">
        Scan this code to visit your campaign page.
      </p>

      <QRCodeCanvas
        value={campaignUrl}
        size={180}
        level="M"
        title={`QR code for ${campaignName}`}
        className="my-5 h-auto max-w-full"
      />

      <div className="hidden" aria-hidden>
        <QRCodeCanvas
          ref={downloadCanvasRef}
          value={campaignUrl}
          size={DOWNLOAD_SIZE}
          level="M"
          marginSize={4}
        />
      </div>

      <Button
        fullWidth
        size="medium"
        variant="contained"
        startIcon={<FileDownloadOutlined />}
        onClick={handleDownload}
        className="!min-h-11 !whitespace-normal !leading-tight"
      >
        Download QR Code
      </Button>
    </BaseModal>
  );
}