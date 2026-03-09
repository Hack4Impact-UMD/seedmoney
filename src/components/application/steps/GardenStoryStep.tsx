"use client";
import Image from "next/image";

import TextField from "@mui/material/TextField";

export default function GardenStoryStep() {
  return (
    <div className="flex flex-col gap-6 w-[700px]">

      {/* Garden Story */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">

        <h2 className="text-[20px] font-medium">
          Garden Story <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">2–3 sentences each</p>

        <TextField
          variant="standard"
          placeholder="Where is your garden, and who does it serve?"
          fullWidth
        />

        <TextField
          variant="standard"
          placeholder="What challenge does your garden help address, and why does it matter locally?"
          fullWidth
        />

        <TextField
          variant="standard"
          placeholder="What happens in the garden during the growing season?"
          fullWidth
        />

        <TextField
          variant="standard"
          placeholder="What will this year’s SeedMoney campaign make possible?"
          fullWidth
        />

      </div>


      {/* Main Photo */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">

        <h2 className="text-[20px] font-medium">
          Main Photo <span className="text-orange-500">*</span>
        </h2>

        <p className="text-sm text-gray-600">
          Upload one clear, high-quality photo that best represents your project.
          This photo will appear at the top of your campaign page.
        </p>

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


      {/* Supporting Photos */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">

        <h2 className="text-[20px] font-medium">
          Supporting Photos
        </h2>

        <p className="text-sm text-gray-600">
          You may upload up to five additional photos that help tell your garden’s story.
          <br />
          *Please choose real, authentic photos of your project and do not upload
          logos, flyers, graphics, or AI-generated images.
        </p>

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


      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2">

        <button
          className="
            border border-green-700
            text-green-700
            px-6 py-2
            min-w-[140px]
            rounded-md
            font-medium
            transition
            hover:bg-green-50
          "
        >
          PREVIOUS STEP
        </button>

        <button
          className="
            bg-green-700
            text-white
            px-6 py-2
            min-w-[140px]
            rounded-md
            font-medium
            transition
            hover:bg-green-800
          "
        >
          NEXT STEP
        </button>

      </div>

    </div>
  );
}