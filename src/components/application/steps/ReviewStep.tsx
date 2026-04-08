"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@mui/material";
import {
  useAgreementGate,
  useApplicationForm,
} from "@/src/components/application/ApplicationFormProvider";
import { getApplicationCompletionState } from "@/src/components/application/applicationStepState";

const stateNames: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

function ValueRow({
  label,
  value,
  required = false,
}: {
  label: string;
  value: string;
  required?: boolean;
}) {
  const isMissing = required && value.trim().length === 0;

  return (
    <div className="flex flex-col gap-1">
      <label className={`text-sm ${isMissing ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </label>
      {isMissing ? (
        <div className="border-b border-[#D32F2F] mt-2" />
      ) : (
        <>
          <p>{value}</p>
          <div className="border-b border-gray-300" />
        </>
      )}
    </div>
  );
}

function ReviewBanner({
  href,
  message,
}: {
  href: string;
  message: string;
}) {
  return (
    <div className="flex justify-between items-center bg-[#FDECEA] text-[#5F2120] px-4 py-3 rounded-md text-sm">
      <div className="flex items-center gap-2">
        <Image src="/icons/error.svg" width={18} height={18} alt="error" />
        <span>{message}</span>
      </div>

      <Link href={href} className="flex items-center gap-2 text-[#D32F2F] font-medium">
        <Image src="/icons/pencil.svg" width={16} height={16} alt="edit" />
        EDIT
      </Link>
    </div>
  );
}

function formatCountry(value: string) {
  return value === "US" ? "United States" : value;
}

export default function ReviewSubmitPage() {
  const form = useApplicationForm();
  const { hasPassedAgreement } = useAgreementGate();
  const values = form.state.values;
  const {
    campaignComplete,
    gardenComplete,
    storyComplete,
    contactComplete,
    reviewComplete,
  } = getApplicationCompletionState(values, hasPassedAgreement);
  const canSubmit = reviewComplete;

  return (
    <div className="w-[700px] flex flex-col gap-6 pb-20 m-15">
      <h2 className="text-xl font-semibold">Campaign Information</h2>

      {!campaignComplete && (
        <ReviewBanner
          href="/apply/campaign"
          message="Please complete campaign information"
        />
      )}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-medium">
            Campaign Title <span className="text-orange-500">*</span>
          </h3>

          <p className="text-sm text-gray-600 mt-1">
            The name of your garden, e.g. Fairview Community Garden,
            Pleasantville Primary School Garden, Holy Jalapeno Church Garden.
          </p>
        </div>

        <ValueRow label="Campaign Title" value={values.campaignTitle} required />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-6">
        <h3 className="text-lg font-medium">
          Project Details & Impact <span className="text-orange-500">*</span>
        </h3>

        <ValueRow
          label="About how many people will benefit from this garden this year?"
          value={values.beneficiaryCount}
          required
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-500">
            Is this a new or existing garden?
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  values.gardenStatus === "new" ? "border-blue-600" : "border-gray-400"
                } flex items-center justify-center`}
              >
                {values.gardenStatus === "new" && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
              <span>New garden</span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  values.gardenStatus === "existing"
                    ? "border-blue-600"
                    : "border-gray-400"
                } flex items-center justify-center`}
              >
                {values.gardenStatus === "existing" && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
              <span>Existing garden</span>
            </div>
          </div>
        </div>

        <ValueRow
          label="Approximate garden size or scope"
          value={values.gardenSize}
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <h3 className="text-lg font-medium">
          Fundraising Goal <span className="text-orange-500">*</span>
        </h3>

        <p className="text-sm text-gray-600">
          Most SeedMoney projects set goals between $500 and $5,000
        </p>

        <ValueRow
          label="Fundraising Goal (USD)"
          value={values.fundraisingGoal}
          required
        />
      </div>

      <h2 className="text-xl font-semibold">Garden Information</h2>

      {!gardenComplete && (
        <ReviewBanner
          href="/apply/garden"
          message="Please complete garden information"
        />
      )}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-6">
        <h3 className="text-lg font-medium">
          Garden Location <span className="text-orange-500">*</span>
        </h3>

        <ValueRow label="City" value={values.gardenCity} required />
        <ValueRow label="State / Province" value={values.gardenState} required />
        <ValueRow
          label="Country"
          value={formatCountry(values.gardenCountry)}
          required
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-2">
        <h3 className="text-lg font-medium">
          Primary Project Category <span className="text-orange-500">*</span>
        </h3>

        <ValueRow label="Category" value={values.gardenCategory} required />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-2">
        <h3 className="text-lg font-medium">
          Beneficiary Populations Served <span className="text-orange-500">*</span>
        </h3>

        <p>{values.gardenBeneficiaries.length > 0 ? values.gardenBeneficiaries.join(", ") : ""}</p>
        <div
          className={`border-b ${
            values.gardenBeneficiaries.length > 0
              ? "border-gray-300"
              : "border-[#D32F2F]"
          }`}
        />
      </div>

      <h2 className="text-xl font-semibold">Garden Story</h2>

      {!storyComplete && (
        <ReviewBanner href="/apply/story" message="Please complete garden story" />
      )}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-6">
        <h3 className="text-lg font-medium">
          Garden Story <span className="text-orange-500">*</span>
        </h3>

        <p className="text-sm">2-3 sentences each</p>

        <ValueRow
          label="Where is your garden, and who does it serve?"
          value={values.storyLocationAndAudience}
          required
        />
        <ValueRow
          label="What challenge does your garden help address, and why does it matter locally?"
          value={values.storyChallenge}
          required
        />
        <ValueRow
          label="What happens in the garden during the growing season?"
          value={values.storySeasonActivity}
          required
        />
        <ValueRow
          label="What will this year's SeedMoney campaign make possible?"
          value={values.storyCampaignImpact}
          required
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <h3 className="text-lg font-medium">
          Main Photo <span className="text-orange-500">*</span>
        </h3>

        <p className="text-sm text-gray-600">
          Upload one clear, high-quality photo that best represents your
          project. This photo will appear at the top of your campaign page.
        </p>

        {values.mainPhoto ? (
          <div className="flex flex-col gap-4">
            <div className="w-[650px] h-[358px] overflow-hidden border border-gray-300">
              <img
                src={values.mainPhoto}
                alt={values.mainPhotoName || "Main photo"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="rounded-lg border border-black/10 px-4 py-3">
              <p className="text-sm font-medium text-gray-800">
                {values.mainPhotoName || "Uploaded image"}
              </p>
              <p className="text-[13px] text-gray-500">
                {Math.round(values.mainPhotoSize / 1000)}kb
                <span className="mx-1.5 text-[10px]">&bull;</span>
                Complete
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-[#D32F2F]">
            <div
              style={{
                filter:
                  "invert(27%) sepia(80%) saturate(800%) hue-rotate(330deg) brightness(85%)",
              }}
            >
              <Image
                src="/icons/upload-icon.svg"
                width={20}
                height={20}
                alt="upload status"
              />
            </div>

            <div>
              <p>Main photo is required.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-6">
        <h3 className="text-lg font-medium">Supporting Photos</h3>

        <p className="text-sm text-gray-600">
          You may upload up to five additional photos that help tell your
          garden’s story.
        </p>

        {values.supportingPhotos.length > 0 ? (
          <div className="flex flex-col gap-6">
            {values.supportingPhotos.map((photo, index) => (
              <div key={`${photo}-${index}`} className="flex flex-col gap-4">
                <div className="w-[650px] h-[358px] overflow-hidden border border-gray-300">
                  <img
                    src={photo}
                    alt={values.supportingPhotoNames[index] || "Supporting photo"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="rounded-lg border border-black/10 px-4 py-3">
                  <p className="text-sm font-medium text-gray-800">
                    {values.supportingPhotoNames[index] || "Uploaded image"}
                  </p>
                  <p className="text-[13px] text-gray-500">
                    {Math.round((values.supportingPhotoSizes[index] ?? 0) / 1000)}kb
                    <span className="mx-1.5 text-[10px]">&bull;</span>
                    Complete
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No supporting photos uploaded.</p>
        )}
      </div>

      <h2 className="text-xl font-semibold">Contact Information</h2>

      {!contactComplete && (
        <ReviewBanner
          href="/apply/contact"
          message="Please complete contact information"
        />
      )}

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <h3 className="text-lg font-medium">
          Organization Information <span className="text-orange-500">*</span>
        </h3>

        <ValueRow
          label="Legal Name of Beneficiary Organization"
          value={values.organizationName}
          required
        />
        <ValueRow
          label="EIN or Public-Sector Identifier"
          value={values.organizationIdentifier}
          required
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <h3 className="text-lg font-medium">
          Beneficiary Organization Mailing Address <span className="text-orange-500">*</span>
        </h3>

        <ValueRow label="Street 1" value={values.mailingStreet1} required />
        <ValueRow label="Street 2" value={values.mailingStreet2} />
        <ValueRow label="City" value={values.mailingCity} required />
        <ValueRow
          label="State / Province"
          value={stateNames[values.mailingState] ?? values.mailingState}
          required
        />
        <ValueRow label="ZIP / Postal Code" value={values.mailingZip} required />
        <ValueRow
          label="Country"
          value={formatCountry(values.mailingCountry)}
          required
        />
      </div>

      <div className="bg-white border border-black/10 rounded-[16px] p-6 flex flex-col gap-4">
        <h3 className="text-lg font-medium">
          Primary Contact Information <span className="text-orange-500">*</span>
        </h3>

        <ValueRow label="First Name" value={values.contactFirstName} required />
        <ValueRow label="Last Name" value={values.contactLastName} required />
        <ValueRow label="Email" value={values.contactEmail} required />
        <ValueRow label="Role or Title" value={values.contactRole} />
      </div>

      <div className="flex justify-between pt-4">
        <Button
          component={Link}
          href="/apply/contact"
          variant="outlined"
          size="medium"
        >
          Previous Step
        </Button>

        <Button
          component={canSubmit ? Link : "button"}
          href={canSubmit ? "/apply/submit" : undefined}
          variant={canSubmit ? "contained" : "text"}
          className={canSubmit ? "!px-4" : "!bg-[#E0E0E0] !px-4"}
          size="medium"
          disabled={!canSubmit}
          onClick={() => form.handleSubmit()}
        >
          Submit Application
        </Button>
      </div>
    </div>
  );
}
