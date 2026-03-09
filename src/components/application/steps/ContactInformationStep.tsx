"use client";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

export default function ContactInformationStep() {
  return (
    <div className="flex flex-col gap-6 w-[700px]">

      {/* Organization Information */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">

        <h2 className="text-[20px] font-medium">
          Organization Information <span className="text-orange-500">*</span>
        </h2>

        <TextField
          variant="standard"
          placeholder="Legal Name of Beneficiary Organization*"
          fullWidth
        />

        <TextField
          variant="standard"
          placeholder="EIN or Public-Sector Identifier*"
          fullWidth
        />

      </div>


      {/* Mailing Address */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">

        <h2 className="text-[20px] font-medium">
          Beneficiary Organization Mailing Address{" "}
          <span className="text-orange-500">*</span>
        </h2>

        <TextField
          variant="standard"
          placeholder="Street 1"
          fullWidth
        />

        <TextField
          variant="standard"
          placeholder="Street 2"
          fullWidth
        />

        <TextField
          variant="standard"
          placeholder="City*"
          fullWidth
        />

        {/* State / Province */}
        <TextField
        select
        variant="standard"
        fullWidth
        value=""
        SelectProps={{
            displayEmpty: true,
            renderValue: (selected) => {
            if (!selected) {
                return <span className="text-gray-400">State / Province*</span>;
            }
            return String(selected);
            },
        }}
        >
        </TextField>

        <TextField
          variant="standard"
          placeholder="ZIP/Postal Code*"
          fullWidth
        />

        {/* Country */}
        <TextField
          select
          variant="standard"
          defaultValue="US"
          fullWidth
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="US">
            United States
          </MenuItem>
        </TextField>

      </div>


      {/* Primary Contact Information */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">

        <h2 className="text-[20px] font-medium">
          Primary Contact Information <span className="text-orange-500">*</span>
        </h2>

        <TextField
          variant="standard"
          placeholder="First Name*"
          fullWidth
        />

        <TextField
          variant="standard"
          placeholder="Last Name*"
          fullWidth
        />

        <TextField
          variant="standard"
          placeholder="Email*"
          fullWidth
        />

        <TextField
          variant="standard"
          placeholder="Role or Title"
          fullWidth
        />

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