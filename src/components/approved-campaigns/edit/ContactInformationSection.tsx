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
} from "@/src/types/frontend/campaignEdit";

interface ContactInformationSectionProps {
  formData: EditCampaignFormData;
  onTextChange: TextChangeHandler;
  setFieldValue: SetFieldValue;
}

function formatOrganizationIdentifier(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

export default function ContactInformationSection({
  formData,
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
          label="EIN or Public-Sector Identifier (Required)"
          fullWidth
          placeholder="e.g., 52-3456789"
          helperText='For US nonprofits, your 9-digit IRS EIN. For schools or government entities, your institutional identifier. For Non US nonprofits, use "00-0000000"'
          inputProps={{
            inputMode: "numeric",
            maxLength: 10,
          }}
          value={formData.organizationIdentifier}
          onChange={(e) =>
            setFieldValue(
              "organizationIdentifier",
              formatOrganizationIdentifier(e.target.value),
            )
          }
        />
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-bold">
          Beneficiary Organization Mailing Address{" "}
          <span className="text-orange-500">*</span>
        </h2>

        <TextField
          variant="standard"
          label="Address Line 1 (Required)"
          fullWidth
          value={formData.mailingStreet1}
          onChange={onTextChange("mailingStreet1")}
        />

        <TextField
          variant="standard"
          label="Apartment, suite, etc. (Optional)"
          fullWidth
          value={formData.mailingStreet2}
          onChange={onTextChange("mailingStreet2")}
        />

        <TextField
          variant="standard"
          label="Country (Required)"
          fullWidth
          value={formData.mailingCountry}
          onChange={onTextChange("mailingCountry")}
        />

        <TextField
          variant="standard"
          label="State or Province (Required)"
          fullWidth
          value={formData.mailingState}
          onChange={onTextChange("mailingState")}
        />

        <TextField
          variant="standard"
          label="City or Town (Required)"
          fullWidth
          value={formData.mailingCity}
          onChange={onTextChange("mailingCity")}
        />

        <TextField
          variant="standard"
          label="ZIP/Postal Code (Required)"
          fullWidth
          value={formData.mailingZip}
          onChange={onTextChange("mailingZip")}
        />
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
