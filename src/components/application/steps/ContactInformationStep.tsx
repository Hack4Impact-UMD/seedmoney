"use client";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
import { useEffect } from "react";
import Link from "next/link";
import { useApplicationForm } from "@/src/components/application/ApplicationFormProvider";

export default function ContactInformationStep() {
  const { form, setCurrentStep, updateStepStatus } = useApplicationForm();
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

  useEffect(() => {
    const computeIsComplete = () => {
      const values = form.getFieldValue;
      return (
        values("organizationName").trim().length > 0 &&
        values("organizationIdentifier").trim().length > 0 &&
        values("mailingStreet1").trim().length > 0 &&
        values("mailingCity").trim().length > 0 &&
        values("mailingState").trim().length > 0 &&
        values("mailingZip").trim().length > 0 &&
        values("mailingCountry").trim().length > 0 &&
        values("contactFirstName").trim().length > 0 &&
        values("contactLastName").trim().length > 0 &&
        values("contactEmail").trim().length > 0
      );
    };

    setCurrentStep("Contact Information");

    return () => {
      updateStepStatus(
        "Contact Information",
        computeIsComplete() ? "completed" : "review",
      );
    };
  }, [form, setCurrentStep, updateStepStatus]);

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
              defaultValue={field.state.value}
              onBlur={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="organizationIdentifier">
          {(field) => (
            <TextField
              variant="standard"
              label="EIN or Public-Sector Identifier*"
              fullWidth
              defaultValue={field.state.value}
              onBlur={(e) => field.handleChange(e.target.value)}
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
              defaultValue={field.state.value}
              onBlur={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="mailingStreet2">
          {(field) => (
            <TextField
              variant="standard"
              label="Street 2"
              fullWidth
              defaultValue={field.state.value}
              onBlur={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="mailingCity">
          {(field) => (
            <TextField
              variant="standard"
              label="City*"
              fullWidth
              defaultValue={field.state.value}
              onBlur={(e) => field.handleChange(e.target.value)}
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
              defaultValue={field.state.value}
              onBlur={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        {/* Country */}
        <form.Field name="mailingCountry">
          {(field) => (
            <TextField
              select
              variant="standard"
              fullWidth
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="US">United States</MenuItem>
            </TextField>
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
              defaultValue={field.state.value}
              onBlur={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="contactLastName">
          {(field) => (
            <TextField
              variant="standard"
              label="Last Name*"
              fullWidth
              defaultValue={field.state.value}
              onBlur={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="contactEmail">
          {(field) => (
            <TextField
              variant="standard"
              label="Email*"
              fullWidth
              defaultValue={field.state.value}
              onBlur={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="contactRole">
          {(field) => (
            <TextField
              variant="standard"
              label="Role or Title"
              fullWidth
              defaultValue={field.state.value}
              onBlur={(e) => field.handleChange(e.target.value)}
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
