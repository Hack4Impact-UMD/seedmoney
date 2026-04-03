"use client";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  EditCampaignFormData,
  SetFieldValue,
  TextChangeHandler,
} from "./types";

interface ContactInformationSectionProps {
  formData: EditCampaignFormData;
  usStates: string[];
  countries: string[];
  onTextChange: TextChangeHandler;
  setFieldValue: SetFieldValue;
}

export default function ContactInformationSection({
  formData,
  usStates,
  countries,
  onTextChange,
  setFieldValue,
}: ContactInformationSectionProps) {
  return (
    <>
      <h1 className="text-2xl font-bold">Contact Information</h1>
      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Organization Information <span className="text-orange-500">*</span>
        </h2>

        <TextField
          variant="standard"
          label="Legal Name of Beneficiary Organization*"
          fullWidth
          value={formData.organizationName}
          onChange={onTextChange("organizationName")}
        />

        <TextField
          variant="standard"
          label="EIN or Public-Sector Identifier*"
          fullWidth
          value={formData.organizationIdentifier}
          onChange={onTextChange("organizationIdentifier")}
        />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Beneficiary Organization Mailing Address{" "}
          <span className="text-orange-500">*</span>
        </h2>

        <TextField
          variant="standard"
          label="Street 1"
          fullWidth
          value={formData.mailingStreet1}
          onChange={onTextChange("mailingStreet1")}
        />

        <TextField
          variant="standard"
          label="Street 2"
          fullWidth
          value={formData.mailingStreet2}
          onChange={onTextChange("mailingStreet2")}
        />

        <TextField
          variant="standard"
          label="City*"
          fullWidth
          value={formData.mailingCity}
          onChange={onTextChange("mailingCity")}
        />

        <FormControl variant="standard" fullWidth>
          <InputLabel>State / Province*</InputLabel>
          <Select
            value={formData.mailingState}
            onChange={(e) => setFieldValue("mailingState", String(e.target.value))}
            label="State / Province*"
          >
            {usStates.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          variant="standard"
          label="ZIP/Postal Code*"
          fullWidth
          value={formData.mailingZip}
          onChange={onTextChange("mailingZip")}
        />

        <FormControl variant="standard" fullWidth>
          <InputLabel>Country*</InputLabel>
          <Select
            value={formData.mailingCountry}
            onChange={(e) =>
              setFieldValue("mailingCountry", String(e.target.value))
            }
            label="Country*"
          >
            {countries.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Primary Contact Information <span className="text-orange-500">*</span>
        </h2>

        <TextField
          variant="standard"
          label="First Name*"
          fullWidth
          value={formData.contactFirstName}
          onChange={onTextChange("contactFirstName")}
        />

        <TextField
          variant="standard"
          label="Last Name*"
          fullWidth
          value={formData.contactLastName}
          onChange={onTextChange("contactLastName")}
        />

        <TextField
          variant="standard"
          label="Email*"
          fullWidth
          value={formData.contactEmail}
          onChange={onTextChange("contactEmail")}
        />

        <TextField
          variant="standard"
          label="Role or Title"
          fullWidth
          value={formData.contactRole}
          onChange={onTextChange("contactRole")}
        />
      </div>
    </>
  );
}
