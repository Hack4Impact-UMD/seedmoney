"use client";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
import { useState } from "react";
import Link from "next/link";

export default function ContactInformationStep() {
  const [state, setState] = useState("");
  const states = [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
  ];

  return (
    <div className="flex flex-col gap-6 w-[700px] m-15">
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

        <TextField variant="standard" placeholder="Street 1" fullWidth />

        <TextField variant="standard" placeholder="Street 2" fullWidth />

        <TextField variant="standard" placeholder="City*" fullWidth />

        {/* State / Province */}
        <TextField
          select
          variant="standard"
          fullWidth
          value={state}
          onChange={(e) => setState(e.target.value as string)}
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
          <MenuItem value="">
            <em>None</em>
          </MenuItem>

          {states.map((s) => (
            <MenuItem key={s.code} value={s.code}>
              {s.name}
            </MenuItem>
          ))}
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
          <MenuItem value="US">United States</MenuItem>
        </TextField>
      </div>

      {/* Primary Contact Information */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Primary Contact Information <span className="text-orange-500">*</span>
        </h2>

        <TextField variant="standard" placeholder="First Name*" fullWidth />

        <TextField variant="standard" placeholder="Last Name*" fullWidth />

        <TextField variant="standard" placeholder="Email*" fullWidth />

        <TextField variant="standard" placeholder="Role or Title" fullWidth />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2">
        <Button
          component={Link}
          href="/apply/story"
          variant="outlined"
          size="medium"
        >
          Previous Step
        </Button>

        <Button
          component={Link}
          href="/apply/review"
          variant="contained"
          size="medium"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
