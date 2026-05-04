"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import CloseIcon from "@mui/icons-material/Close";
import Cropper, { Area, Point } from "react-easy-crop";

type CropImageDialogueProps = {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
};

export default function CropImageDialogue({
  open,
  onClose,
  imageSrc,
}: CropImageDialogueProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  const handleCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
              aspect={4 / 3}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={(value) => setZoom(Number(value))}
            />
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#344054]">Zoom</span>
              <span className="text-sm text-[#667085]">
                {zoom.toFixed(1)}x
              </span>
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
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
