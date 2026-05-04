import React, { useState } from "react";
import Slider from "@mui/material/Slider";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop";

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
  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    console.log(croppedArea, croppedAreaPixels);
  };

  return (
    <div className="App">
      <div className="crop-container">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <div className="controls">
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e, zoom) => setZoom(Number(zoom))}
          classes={{ root: "slider" }}
        />
      </div>
    </div>
  );
}
