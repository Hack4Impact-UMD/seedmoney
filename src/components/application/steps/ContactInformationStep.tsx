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

export default function ContactInformationStep() {
  const form = useApplicationForm();
  const router = useRouter();
  const { saveDraftCampaign } = useSaveDraftCampaign();
  const isUsMailingCountry =
    form.state.values.mailingCountry.trim().toLowerCase() === "us" ||
    form.state.values.mailingCountry.trim().toLowerCase() === "united states";
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
              label="EIN or Public-Sector Identifier*"
              fullWidth
              name="organizationIdentifier"
              value={field.state.value}
              onBlur={async (e) => {
                field.handleBlur();
                await saveContactDraft({
                  organizationIdentifier: e.target.value,
                });
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
              label={<>Street 1*</>}
              fullWidth
              name="mailingStreet1"
              autoComplete="address-line1"
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
              label="Street 2"
              fullWidth
              name="mailingStreet2"
              autoComplete="address-line2"
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
              label="Country*"
              variant="standard"
              fullWidth
              name="mailingCountry"
              value={field.state.value}
              onChange={async (e) => {
                field.handleChange(e.target.value);
                await saveContactDraft({ mailingCountry: e.target.value });
              }}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return <span className="text-gray-400">Country*</span>;
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
              label="City*"
              fullWidth
              name="mailingCity"
              autoComplete="address-level2"
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
                variant="standard"
                fullWidth
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

                {STATES.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                variant="standard"
                label="State / Province*"
                helperText="Write N/A if not applicable"
                fullWidth
                name="mailingState"
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
              label="ZIP/Postal Code*"
              fullWidth
              name="mailingZip"
              autoComplete="postal-code"
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
              label="Last Name*"
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
              label="Email*"
              fullWidth
              name="contactEmail"
              autoComplete="email"
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
              label="Role or Title"
              fullWidth
              name="contactRole"
              autoComplete="organization-title"
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
          component="button"
          variant="contained"
          size="medium"
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
