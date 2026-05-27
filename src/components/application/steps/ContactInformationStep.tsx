"use client";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
import Link from "next/link";
import { useApplicationForm } from "@/src/components/application/ApplicationFormProvider";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import useSaveDraftCampaign from "@/src/hooks/campaigns/useSaveDraftCampaign";
import { STATES, COUNTRIES } from "@/src/components/application/addressOptions";

function formatOrganizationIdentifier(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

export default function ContactInformationStep() {
  const form = useApplicationForm();
  const router = useRouter();
  const { saveDraftCampaign } = useSaveDraftCampaign();
  const normalizeCountryValue = (value: string) => value.trim().toLowerCase();
  const isUsMailingCountry =
    normalizeCountryValue(form.state.values.mailingCountry) === "us" ||
    normalizeCountryValue(form.state.values.mailingCountry) ===
      "united states";
  const contactInformationRef = useRef({
    organization_name: form.state.values.organizationName,
    ein: form.state.values.organizationIdentifier,
    mailing_street_1: form.state.values.mailingStreet1,
    mailing_street_2: form.state.values.mailingStreet2,
    mailing_city: form.state.values.mailingCity,
    mailing_state: form.state.values.mailingState,
    mailing_zipcode: form.state.values.mailingZip,
    mailing_country: form.state.values.mailingCountry,
    contact_first_name: form.state.values.contactFirstName,
    contact_last_name: form.state.values.contactLastName,
    contact_email: form.state.values.contactEmail,
    contact_role: form.state.values.contactRole,
  });
  const saveContactDraft = async (
    overrides: Partial<typeof form.state.values> = {},
  ) => {
    const values = {
      ...form.state.values,
      ...overrides,
    };

    const currentPayload = {
      organization_name: values.organizationName,
      ein: values.organizationIdentifier,
      mailing_street_1: values.mailingStreet1,
      mailing_street_2: values.mailingStreet2,
      mailing_city: values.mailingCity,
      mailing_state: values.mailingState,
      mailing_zipcode: values.mailingZip,
      mailing_country: values.mailingCountry,
      contact_first_name: values.contactFirstName,
      contact_last_name: values.contactLastName,
      contact_email: values.contactEmail,
      contact_role: values.contactRole,
    };

    const changedValues: Partial<typeof currentPayload> = {};

    if (
      currentPayload.organization_name !==
      contactInformationRef.current.organization_name
    ) {
      changedValues.organization_name = currentPayload.organization_name;
    }

    if (currentPayload.ein !== contactInformationRef.current.ein) {
      changedValues.ein = currentPayload.ein;
    }

    if (
      currentPayload.mailing_street_1 !==
      contactInformationRef.current.mailing_street_1
    ) {
      changedValues.mailing_street_1 = currentPayload.mailing_street_1;
    }

    if (
      currentPayload.mailing_street_2 !==
      contactInformationRef.current.mailing_street_2
    ) {
      changedValues.mailing_street_2 = currentPayload.mailing_street_2;
    }

    if (
      currentPayload.mailing_city !== contactInformationRef.current.mailing_city
    ) {
      changedValues.mailing_city = currentPayload.mailing_city;
    }

    if (
      currentPayload.mailing_state !==
      contactInformationRef.current.mailing_state
    ) {
      changedValues.mailing_state = currentPayload.mailing_state;
    }

    if (
      currentPayload.mailing_zipcode !==
      contactInformationRef.current.mailing_zipcode
    ) {
      changedValues.mailing_zipcode = currentPayload.mailing_zipcode;
    }

    if (
      currentPayload.mailing_country !==
      contactInformationRef.current.mailing_country
    ) {
      changedValues.mailing_country = currentPayload.mailing_country;
    }

    if (
      currentPayload.contact_first_name !==
      contactInformationRef.current.contact_first_name
    ) {
      changedValues.contact_first_name = currentPayload.contact_first_name;
    }

    if (
      currentPayload.contact_last_name !==
      contactInformationRef.current.contact_last_name
    ) {
      changedValues.contact_last_name = currentPayload.contact_last_name;
    }

    if (
      currentPayload.contact_email !==
      contactInformationRef.current.contact_email
    ) {
      changedValues.contact_email = currentPayload.contact_email;
    }

    if (
      currentPayload.contact_role !== contactInformationRef.current.contact_role
    ) {
      changedValues.contact_role = currentPayload.contact_role;
    }

    if (Object.keys(changedValues).length === 0) {
      return;
    }

    await saveDraftCampaign(changedValues);
    contactInformationRef.current = currentPayload;
  };

  return (
    <div className="mx-auto my-10 flex w-full max-w-[640px] flex-col gap-5">
      {/* Organization Information */}
      <div className="bg-white rounded-2xl border border-black/10 p-5 flex flex-col gap-4">
        <h2 className="text-[18px] font-medium">
          Organization Information <span className="text-red-500">*</span>
        </h2>

        <form.Field name="organizationName">
          {(field) => (
            <TextField
              variant="standard"
              label="Legal Name of Beneficiary Organization (Required)"
              fullWidth
              name="organizationName"
              autoComplete="organization"
              placeholder="e.g., Riverside Neighborhood Association, Inc."
              helperText="The official name of the nonprofit, school, government entity, or fiscal sponsor that will receive funds. We cannot send funds to individuals."
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveContactDraft({ organizationName: e.target.value });
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
              label="EIN or Public-Sector Identifier (Required)"
              fullWidth
              name="organizationIdentifier"
              placeholder="e.g., 52-3456789"
              helperText='For US nonprofits, your 9-digit IRS EIN. For schools or government entities, your institutional identifier. For Non US nonprofits, use "00-0000000"'
              inputProps={{
                inputMode: "numeric",
                maxLength: 10,
              }}
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveContactDraft({
                  organizationIdentifier: formatOrganizationIdentifier(
                    e.target.value,
                  ),
                });
              }}
              onChange={(e) =>
                field.handleChange(formatOrganizationIdentifier(e.target.value))
              }
              onInput={(e) =>
                field.handleChange(
                  formatOrganizationIdentifier(
                    (e.target as HTMLInputElement).value,
                  ),
                )
              }
            />
          )}
        </form.Field>
      </div>

      {/* Mailing Address */}
      <div className="bg-white rounded-2xl border border-black/10 p-5 flex flex-col gap-4">
        <h2 className="text-[18px] font-medium">
          Beneficiary Organization Mailing Address{" "}
          <span className="text-red-500">*</span>
        </h2>

        <form.Field name="mailingStreet1">
          {(field) => (
            <TextField
              variant="standard"
              label="Address Line 1 (Required)"
              fullWidth
              name="mailingStreet1"
              autoComplete="new-password"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveContactDraft({ mailingStreet1: e.target.value });
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
              label="Apartment, suite, etc. (Optional)"
              fullWidth
              name="mailingStreet2"
              autoComplete="new-password"
              helperText="e.g., 3rd floor"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveContactDraft({ mailingStreet2: e.target.value });
              }}
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
              select
              label="Country (Required)"
              variant="standard"
              fullWidth
              name="mailingCountry"
              autoComplete="new-password"
              value={field.state.value}
              onChange={async (e) => {
                const nextCountry = e.target.value;
                const shouldClearState =
                  normalizeCountryValue(nextCountry) === "us" ||
                  normalizeCountryValue(nextCountry) === "united states";

                field.handleChange(nextCountry);

                if (shouldClearState) {
                  form.setFieldValue("mailingState", "");
                }

                await saveContactDraft({
                  mailingCountry: nextCountry,
                  ...(shouldClearState ? { mailingState: "" } : {}),
                });
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return (
                      <span className="text-gray-400">
                        Country (Required)
                      </span>
                    );
                  }
                  return String(selected);
                },
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>

              {field.state.value && !COUNTRIES.includes(field.state.value) && (
                <MenuItem value={field.state.value}>{field.state.value}</MenuItem>
              )}

              {COUNTRIES.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </TextField>
          )}
        </form.Field>

        <form.Field name="mailingCity">
          {(field) => (
            <TextField
              variant="standard"
              label="City or Town (Required)"
              fullWidth
              name="mailingCity"
              autoComplete="new-password"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveContactDraft({ mailingCity: e.target.value });
              }}
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
            isUsMailingCountry ? (
              <TextField
                select
                label="State or Province (Required)"
                variant="standard"
                fullWidth
                name="mailingState"
                autoComplete="new-password"
                value={field.state.value}
                onChange={async (e) => {
                  field.handleChange(e.target.value);
                  await saveContactDraft({ mailingState: e.target.value });
                }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <span className="text-gray-400">
                          State or Province (Required)
                        </span>
                      );
                    }
                    const selectedState = STATES.find(
                      (state) => state.code === selected,
                    );
                    return selectedState?.name ?? String(selected);
                  },
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>

                {STATES.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                variant="standard"
                label="State or Province (Required)"
                helperText="Write N/A if not applicable"
                fullWidth
                name="mailingState"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={async (e) => {
                  field.handleBlur();
                  await saveContactDraft({ mailingState: e.target.value });
                }}
                onChange={(e) => field.handleChange(e.target.value)}
                onInput={(e) =>
                  field.handleChange((e.target as HTMLInputElement).value)
                }
              />
            )
          )}
        </form.Field>

        <form.Field name="mailingZip">
          {(field) => (
            <TextField
              variant="standard"
              label="ZIP/Postal Code (Required)"
              fullWidth
              name="mailingZip"
              autoComplete="new-password"
              helperText='Enter "00000" if not applicable'
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveContactDraft({ mailingZip: e.target.value });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>
      </div>

      {/* Primary Contact Information */}
      <div className="bg-white rounded-2xl border border-black/10 p-5 flex flex-col gap-4">
        <h2 className="text-[18px] font-medium">
          Primary Contact Information <span className="text-red-500">*</span>
        </h2>

        <form.Field name="contactFirstName">
          {(field) => (
            <TextField
              variant="standard"
              label="First Name (Required)"
              fullWidth
              name="contactFirstName"
              autoComplete="given-name"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveContactDraft({ contactFirstName: e.target.value });
              }}
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
              label="Last Name (Required)"
              fullWidth
              name="contactLastName"
              autoComplete="family-name"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveContactDraft({ contactLastName: e.target.value });
              }}
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
              label="Email (Required)"
              fullWidth
              name="contactEmail"
              autoComplete="email"
              helperText="This email will be used for your dashboard login and all campaign notifications. Please use an address you check regularly."
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveContactDraft({ contactEmail: e.target.value });
              }}
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
              label="Role or Title (Optional)"
              fullWidth
              name="contactRole"
              autoComplete="organization-title"
              placeholder="e.g., Garden Coordinator, Executive Director, Volunteer Lead"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveContactDraft({ contactRole: e.target.value });
              }}
              onChange={(e) => field.handleChange(e.target.value)}
              onInput={(e) =>
                field.handleChange((e.target as HTMLInputElement).value)
              }
            />
          )}
        </form.Field>
      </div>

      {/* Navigation Buttons */}
      <div className="flex w-full flex-col-reverse gap-3 md:flex-row md:justify-between md:gap-0 pt-2">
        <Button
          component={Link}
          href="/apply/story"
          variant="outlined"
          size="medium"
          className="w-full md:w-auto"
        >
          Previous Step
        </Button>

        <Button
          component="button"
          variant="contained"
          size="medium"
          className="w-full md:w-auto"
          onClick={async () => {
            await saveContactDraft();
            router.push("/apply/review");
          }}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
