"use client";

import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import CloseIcon from "@mui/icons-material/Close";
import Cropper, { Area, Point } from "react-easy-crop";

const PREVIEW_ASPECT_RATIO = 650 / 358;

type CropImageDialogueProps = {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  imageName: string;
  initialCrop?: Point;
  initialZoom?: number;
  onDone: (
    croppedFile: File,
    cropState: { crop: Point; zoom: number },
  ) => Promise<void> | void;
};

async function loadImage(src: string) {
  const sourceBlob = await fetch(src).then(async (response) => {
    if (!response.ok) {
      throw new Error("Failed to load image for cropping.");
    }

    return response.blob();
  });
  const sourceUrl = URL.createObjectURL(sourceBlob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new window.Image();

      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Failed to decode image."));
      nextImage.src = sourceUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

async function getCroppedFile({
  imageSrc,
  imageName,
  cropAreaPixels,
}: {
  imageSrc: string;
  imageName: string;
  cropAreaPixels: Area;
}) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = cropAreaPixels.width;
  canvas.height = cropAreaPixels.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to create crop canvas.");
  }

  context.drawImage(
    image,
    cropAreaPixels.x,
    cropAreaPixels.y,
    cropAreaPixels.width,
    cropAreaPixels.height,
    0,
    0,
    cropAreaPixels.width,
    cropAreaPixels.height,
  );

  const croppedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to generate cropped image."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });

  return new File([croppedBlob], imageName, {
    type: croppedBlob.type || "image/png",
  });
}

export default function CropImageDialogue({
  open,
  onClose,
  imageSrc,
  imageName,
  initialCrop,
  initialZoom,
  onDone,
}: CropImageDialogueProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCrop(initialCrop ?? { x: 0, y: 0 });
    setZoom(initialZoom ?? 1);
    setCroppedAreaPixels(null);
    setIsSubmitting(false);
  }, [imageSrc, initialCrop, initialZoom, open]);

  const handleClose = () => {
    setCroppedAreaPixels(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleDone = async () => {
    if (!croppedAreaPixels) {
      handleClose();
      return;
    }

    try {
      setIsSubmitting(true);
      const croppedFile = await getCroppedFile({
        imageSrc,
        imageName,
        cropAreaPixels: croppedAreaPixels,
      });
      await onDone(croppedFile, { crop, zoom });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        className:
          "!m-4 !w-[calc(100%-2rem)] !max-w-[720px] !overflow-hidden !rounded-2xl !bg-white",
      }}
    >
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-[#123A1E]">Crop Image</h2>
          <p className="mt-1 text-sm text-[#667085]">
            Adjust the crop area and zoom before continuing.
          </p>
        </div>
        <IconButton
          onClick={handleClose}
          aria-label="Close crop dialog"
          className="!text-[#667085]"
        >
          <CloseIcon />
        </IconButton>
      </div>

      <DialogContent className="!p-0">
        <div className="px-6 py-5">
          <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-[#101828]">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={PREVIEW_ASPECT_RATIO}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={(value) => setZoom(Number(value))}
            />
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#344054]">Zoom</span>
              <span className="text-sm text-[#667085]">{zoom.toFixed(1)}x</span>
            </div>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-label="Zoom"
              onChange={(_event, value) => setZoom(Number(value))}
              className="text-[#2D7A45]"
            />
          </div>
        </div>
      </DialogContent>

      <DialogActions className="!border-t !border-[#E5E7EB] !px-6 !py-4">
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleDone}
          disabled={isSubmitting}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
