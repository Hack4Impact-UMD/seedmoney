"use client";

import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import CloseIcon from "@mui/icons-material/Close";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import FlipIcon from "@mui/icons-material/Flip";
import Cropper, { Area, Point } from "react-easy-crop";

const CROP_FRAME_ASPECT_RATIO = 530 / 398;

type CropImageDialogueProps = {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  imageName: string;
  initialCrop?: Point;
  initialZoom?: number;
  initialRotation?: number;
  initialFlipX?: boolean;
  onDone: (
    croppedFile: File,
    cropState: {
      crop: Point;
      zoom: number;
      rotation: number;
      flipX: boolean;
    },
  ) => Promise<void> | void;
};

function rotateSize(width: number, height: number, rotation: number) {
  const radians = (rotation * Math.PI) / 180;

  return {
    width:
      Math.abs(Math.cos(radians) * width) +
      Math.abs(Math.sin(radians) * height),
    height:
      Math.abs(Math.sin(radians) * width) +
      Math.abs(Math.cos(radians) * height),
  };
}

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
  rotation,
  flipX,
}: {
  imageSrc: string;
  imageName: string;
  cropAreaPixels: Area;
  rotation: number;
  flipX: boolean;
}) {
  const image = await loadImage(imageSrc);
  const rotationRadians = (rotation * Math.PI) / 180;
  const rotatedSize = rotateSize(image.width, image.height, rotation);

  const transformCanvas = document.createElement("canvas");
  transformCanvas.width = rotatedSize.width;
  transformCanvas.height = rotatedSize.height;

  const transformContext = transformCanvas.getContext("2d");
  if (!transformContext) {
    throw new Error("Failed to create crop canvas.");
  }

  transformContext.translate(rotatedSize.width / 2, rotatedSize.height / 2);
  transformContext.rotate(rotationRadians);
  transformContext.scale(flipX ? -1 : 1, 1);
  transformContext.drawImage(
    image,
    -image.width / 2,
    -image.height / 2,
  );

  const canvas = document.createElement("canvas");
  canvas.width = cropAreaPixels.width;
  canvas.height = cropAreaPixels.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to create cropped image canvas.");
  }

  context.drawImage(
    transformCanvas,
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
  initialRotation,
  initialFlipX,
  onDone,
}: CropImageDialogueProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setCrop(initialCrop ?? { x: 0, y: 0 });
    setZoom(initialZoom ?? 1);
    setRotation(initialRotation ?? 0);
    setFlipX(initialFlipX ?? false);
    setCroppedAreaPixels(null);
    setIsSubmitting(false);
  }, [imageSrc, initialCrop, initialFlipX, initialRotation, initialZoom, open]);

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
        rotation,
        flipX,
      });
      await onDone(croppedFile, { crop, zoom, rotation, flipX });
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
          "!m-4 !w-[calc(100%-2rem)] !max-w-[800px] !overflow-hidden !rounded-[4px] !bg-white !shadow-[0px_9px_46px_8px_rgba(0,0,0,0.12),0px_24px_38px_3px_rgba(0,0,0,0.14),0px_11px_15px_-7px_rgba(0,0,0,0.2)]",
      }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="min-w-0 flex-1 pb-[7px]">
          <h2 className="w-full text-[20px] font-bold leading-[1.6] text-[#123A1E]">
            Crop Image
          </h2>
        </div>
        <IconButton
          onClick={handleClose}
          aria-label="Close crop dialog"
          className="!rounded-none !p-0 !text-[#6B6B6B] hover:!bg-transparent"
        >
          <CloseIcon className="!text-[24px]" />
        </IconButton>
      </div>

      <div className="flex items-center justify-center px-6 py-4">
        <p className="min-w-0 flex-1 text-[16px] leading-[1.5] text-[#666666]">
          Drag and resize your image by dragging the image or using the slider.
        </p>
      </div>

      <div className="w-full bg-[#8a8a8a]">
        <div className="mx-auto flex h-[398px] w-full max-w-[800px] items-center justify-center overflow-hidden">
          <div className="relative h-[398px] w-full max-w-[530px] overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom}) scaleX(${flipX ? -1 : 1})`}
              aspect={CROP_FRAME_ASPECT_RATIO}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={(value) => setZoom(Number(value))}
            />
          </div>
        </div>
      </div>

      <div className="flex h-[54px] items-center justify-between border-t border-black/10 px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 pr-6">
          <span className="shrink-0 text-[16px] leading-[1.5] text-[#6A7282]">
            Zoom:
          </span>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-label="Zoom"
            onChange={(_event, value) => setZoom(Number(value))}
            className="!mx-0 flex-1 text-[#2D7A45]"
            slotProps={{
              rail: {
                className: "!h-1 !rounded-[10px] !bg-[#E0E0E0] !opacity-100",
              },
              track: {
                className: "!h-1 !rounded-[10px] !border-none !bg-[#D5DDE5]",
              },
              thumb: {
                className:
                  "!h-5 !w-5 !bg-[#2D7A45] !shadow-none before:!shadow-none after:!shadow-none",
              },
            }}
          />
          <span className="shrink-0 text-[14px] leading-[21px] text-[#6A7282]">
            {zoom.toFixed(1)}x
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-[18px]">
          <IconButton
            onClick={() => setRotation((previous) => previous + 90)}
            aria-label="Rotate image clockwise"
            className="!rounded-none !p-0 !text-[#123A1E] hover:!bg-transparent"
          >
            <RotateRightIcon className="!text-[28px]" />
          </IconButton>
          <IconButton
            onClick={() => setFlipX((previous) => !previous)}
            aria-label="Flip image on vertical axis"
            className="!rounded-none !p-0 !text-[#123A1E] hover:!bg-transparent"
          >
            <FlipIcon className="!text-[28px]" />
          </IconButton>
        </div>
      </div>

      <div className="flex items-center justify-end p-2">
        <div className="flex items-center gap-2">
          <Button
            variant="text"
            onClick={handleClose}
            disabled={isSubmitting}
            className="!min-w-0 !rounded-[8px] !px-2 !py-2.5 !text-[14px] !font-bold !uppercase !leading-4 !text-[#666666] hover:!bg-transparent"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDone}
            disabled={isSubmitting}
            className="!min-w-0 !rounded-[8px] !bg-[#2D7A45] !px-[14px] !py-2.5 !text-[14px] !font-bold !uppercase !leading-4 !text-white hover:!bg-[#246239]"
          >
            Apply Crop
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
