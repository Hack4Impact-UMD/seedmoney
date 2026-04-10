"use client";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
import Link from "next/link";
import { useApplicationForm } from "@/src/components/application/ApplicationFormProvider";
import { useState } from "react";
import useSaveDraftCampaign from "@/src/hooks/campaigns/useSaveDraftCampaign";

export default function ContactInformationStep() {
  const form = useApplicationForm();
  const { saveDraftCampaign } = useSaveDraftCampaign();
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

        <form.Field name="organizationName">
          {(field) => (
            <TextField
              variant="standard"
              label="Legal Name of Beneficiary Organization*"
              fullWidth
              name="organizationName"
              autoComplete="organization"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveDraftCampaign({ organization_name: e.target.value });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="organizationIdentifier">
          {(field) => (
            <TextField
              variant="standard"
              label="EIN or Public-Sector Identifier*"
              fullWidth
              name="organizationIdentifier"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveDraftCampaign({ ein: e.target.value });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>
      </div>

      {/* Mailing Address */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Beneficiary Organization Mailing Address{" "}
          <span className="text-orange-500">*</span>
        </h2>

        <form.Field name="mailingStreet1">
          {(field) => (
            <TextField
              variant="standard"
              label="Street 1"
              fullWidth
              name="mailingStreet1"
              autoComplete="address-line1"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveDraftCampaign({ mailing_street_1: e.target.value });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="mailingStreet2">
          {(field) => (
            <TextField
              variant="standard"
              label="Street 2"
              fullWidth
              name="mailingStreet2"
              autoComplete="address-line2"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="mailingCity">
          {(field) => (
            <TextField
              variant="standard"
              label="City*"
              fullWidth
              name="mailingCity"
              autoComplete="address-level2"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        {/* State / Province */}
        <form.Field name="mailingState">
          {(field) => (
            <TextField
              select
              variant="standard"
              fullWidth
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return (
                      <span className="text-gray-400">State / Province*</span>
                    );
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
          )}
        </form.Field>

        <form.Field name="mailingZip">
          {(field) => (
            <TextField
              variant="standard"
              label="ZIP/Postal Code*"
              fullWidth
              name="mailingZip"
              autoComplete="postal-code"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        {/* Country */}
        <form.Field name="mailingCountry">
          {(field) => (
            <TextField
              label="Country"
              variant="standard"
              fullWidth
              name="mailingCountry"
              autoComplete="country-name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>
      </div>

      {/* Primary Contact Information */}
      <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
        <h2 className="text-[20px] font-medium">
          Primary Contact Information <span className="text-orange-500">*</span>
        </h2>

        <form.Field name="contactFirstName">
          {(field) => (
            <TextField
              variant="standard"
              label="First Name*"
              fullWidth
              name="contactFirstName"
              autoComplete="given-name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="contactLastName">
          {(field) => (
            <TextField
              variant="standard"
              label="Last Name*"
              fullWidth
              name="contactLastName"
              autoComplete="family-name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="contactEmail">
          {(field) => (
            <TextField
              variant="standard"
              label="Email*"
              fullWidth
              name="contactEmail"
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>

        <form.Field name="contactRole">
          {(field) => (
            <TextField
              variant="standard"
              label="Role or Title"
              fullWidth
              name="contactRole"
              autoComplete="organization-title"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>
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
