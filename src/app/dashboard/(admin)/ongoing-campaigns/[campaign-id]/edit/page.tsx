"use client";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import { ArrowBack } from "@mui/icons-material";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useState } from "react";
import {
  UploadFile,
  Delete,
  CheckCircle,
  Close,
  CheckCircleOutline,
} from "@mui/icons-material";

const MOCK_CAMPAIGN_DATA = {
  campaignTitle: "Fully Belly Community Garden",
  beneficiaryCount: "250",
  gardenSize: "2000",
  gardenStatus: "existing",
  fundraisingGoal: "3500",
  gardenCity: "Scarborough",
  gardenState: "Maine",
  gardenCountry: "United States",
  gardenCategory: "Community Garden",
  gardenBeneficiaries: ["Children (ages 0-12)", "Families"],
  organizationName: "Full Belly Gardeners Association",
  organizationIdentifier: "12-3456789",
  mailingStreet1: "123 Scarborough Dr",
  mailingStreet2: "",
  mailingCity: "Scarborough",
  mailingState: "Maine",
  mailingZip: "98921",
  mailingCountry: "United States",
  contactFirstName: "Roger",
  contactLastName: "Doiron",
  contactEmail: "rogerdoiron@gmail.cpm",
  contactRole: "Director",
  storyLocationAndAudience:
    "The Full Belly Community Garden in Scarborough, Maine, provide over 300 pounds of produce annually to local food-insecure families and seniors. Beyond its harvest, it serves as an education hub for at-risk youth and neighbors through nature exploration and hands-on workshops.",
  storyLocationAndAudienceAI:
    "The Full Belly Community Garden in Scarborough, Maine, provides over 300 pounds of organic produce annually to local food-insecure families and seniors. Beyond its harvest, it serves as an educational hub for at-risk youth and neighbors through nature exploration and hands-on workshops.",
  storyLocationAndAudienceFinal:
    "The Full Belly Community Garden in Scarborough, Maine, provides over 300 pounds of produce annually to local food-insecure families and seniors. Beyond its harvest, it serves as an educational hub for at-risk youth and neighbors through nature exploration and hands-on gardening workshops.",
  storyChallenge:
    "The Full Belly Community Garden addresses the challenge of food insecurity, specifically the difficulty many local families and seniors face in accessing fresh, affordable organic produce.",
  storySeasonActivity:
    "During the growing season, it serves as a 'vibrant oasis' where volunteers host monthly workshops to teach gardening skills and provide a safe space for at-risk youth to explore nature.",
  storyCampaignImpact:
    "These contributions allow the garden to continue its mission of providing over 300 pounds of organic food to local food-insecure families and seniors at the Elm Street Senior Center.",
};

const categoryOptions = [
  "Community Garden",
  "School or Youth Garden",
  "Food Pantry or Food Bank Garden",
  "Urban Farm",
  "Refugee or Immigrant Garden",
  "Tribal or Indigenous Garden Project",
  "Shelter or Transitional Housing Garden",
  "Therapeutic or Healing Garden",
  "Job Training or Vocational Garden",
  "Demonstration or Education Garden",
  "Multi-Site Garden Program",
  "Other (please specify)",
];

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "New Zealand",
  "India",
  "Germany",
  "France",
  "Japan",
  "Mexico",
];

const beneficiaryOptions = [
  "Children (ages 0-12)",
  "Youth / Adolescents (ages 13-18)",
  "Families",
  "Seniors / Older adults",
  "Low-income individuals or households",
  "Food-insecure individuals or households",
  "Immigrants and refugees",
  "Indigenous / Native communities",
  "People with disabilities",
  "Veterans and military families",
  "People experiencing homelessness or housing insecurity",
  "Unemployed or underemployed individuals",
  "Justice-involved individuals",
  "Rural communities",
  "Urban communities",
  "Other (please specify)",
];

export default function EditCampaignPage() {
  const params = useParams();
  const campaignId = params["campaign-id"];

  const router = useRouter();
  const [initialData, setInitialData] = useState(MOCK_CAMPAIGN_DATA);
  const [formData, setFormData] = useState(MOCK_CAMPAIGN_DATA);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const isFormDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleStatusChange = (status: "new" | "existing") => {
    setFormData((prev) => ({
      ...prev,
      gardenStatus: status,
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      gardenCategory: category,
    }));
  };

  const handleCheckboxChange = (option: string) => {
    setFormData((prev) => {
      const current = prev.gardenBeneficiaries;
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, gardenBeneficiaries: next };
    });
  };

  return (
    <div className="flex min-h-screen">
      <Navbar
        campaigns={[
          {
            campaign_id: Number(campaignId),
            name: formData.campaignTitle,
            status: "published",
            date_created: new Date().toISOString(),
          } as any,
        ]}
        selectedCampaignId={Number(campaignId)}
        onCampaignSelect={() => {}}
      />
      <div className="flex-1 flex flex-col bg-gray-50 pl-10 pr-32 py-10 space-y-3 overflow-y-auto">
        <h3 className="text-4xl font-bold text-[#096B2E] mb-5">
          Edit Campaign - {campaignId}
        </h3>
        <button
          onClick={() => setIsCancelModalOpen(true)}
          className="flex items-center uppercase !text-[#666666] text-sm font-bold hover:text-gray-800 transition w-fit"
        >
          <ArrowBack className="mr-1 !text-sm" fontSize="inherit" />
          Back
        </button>

        {/* Main Content Area in 2 Columns */}
        <div className="flex gap-24 items-start">
          {/* Left Column: Form Sections */}
          <div className="flex-1 flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Campaign Information</h1>
            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Campaign Title <span className="text-orange-500">*</span>
              </h2>

              <p className="text-sm text-gray-600">
                The name of your garden, e.g. Fairview Community Garden,
                Pleasantville Primary School Garden, Holy Jalapeno Church
                Garden, etc.
              </p>

              <TextField
                label="Campaign Title"
                value={formData.campaignTitle}
                onChange={handleChange("campaignTitle")}
                helperText="60 max characters"
                fullWidth
                variant="standard"
              />
            </div>

            {/* project details & impact */}
            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Project Details & Impact{" "}
                <span className="text-orange-500">*</span>
              </h2>

              <TextField
                label="About how many people will benefit from this garden this year?"
                variant="standard"
                fullWidth
                value={formData.beneficiaryCount}
                onChange={handleChange("beneficiaryCount")}
                type="number"
              />

              <p className="text-sm pt-2">Is this a new or existing garden?</p>

              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="gardenStatus"
                    value="new"
                    checked={formData.gardenStatus === "new"}
                    onChange={() => handleStatusChange("new")}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="text-sm">New garden</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="gardenStatus"
                    value="existing"
                    checked={formData.gardenStatus === "existing"}
                    onChange={() => handleStatusChange("existing")}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="text-sm">Existing garden</span>
                </label>
              </div>

              <TextField
                label="Approximate garden size or scope"
                variant="standard"
                fullWidth
                value={formData.gardenSize}
                onChange={handleChange("gardenSize")}
              />
            </div>

            {/* fundraising goal */}
            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Fundraising Goal <span className="text-orange-500">*</span>
              </h2>

              <p className="text-sm text-gray-600">
                Most SeedMoney projects set goals between $500 and $5,000
              </p>

              <TextField
                label="Fundraising Goal (USD)"
                variant="standard"
                fullWidth
                type="number"
                value={formData.fundraisingGoal}
                onChange={handleChange("fundraisingGoal")}
              />
            </div>
            <h1 className="text-2xl font-bold">Garden Information</h1>
            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Garden Location <span className="text-orange-500">*</span>
              </h2>

              <TextField
                label="City"
                variant="standard"
                fullWidth
                value={formData.gardenCity}
                onChange={handleChange("gardenCity")}
              />

              <FormControl variant="standard" fullWidth>
                <InputLabel>State / Province</InputLabel>
                <Select
                  value={formData.gardenState}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gardenState: e.target.value,
                    }))
                  }
                  label="State / Province"
                >
                  {US_STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.gardenCountry}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      gardenCountry: e.target.value,
                    }))
                  }
                  label="Country"
                >
                  {COUNTRIES.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Primary Project Category */}
            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Primary Project Category{" "}
                <span className="text-orange-500">*</span>
              </h2>

              <p className="text-sm">Select one:</p>

              <div className="flex flex-col gap-3">
                {categoryOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="gardenCategory"
                      checked={formData.gardenCategory === option}
                      onChange={() => handleCategoryChange(option)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span className="text-sm group-hover:text-gray-900">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Beneficiary Populations Served */}
            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Beneficiary Populations Served{" "}
                <span className="text-orange-500">*</span>
              </h2>

              <p className="text-sm">Select all that apply:</p>

              <div className="flex flex-col gap-3">
                {beneficiaryOptions.map((option) => {
                  const isChecked =
                    formData.gardenBeneficiaries.includes(option);
                  return (
                    <label
                      key={option}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(option)}
                        className="w-[18px] h-[18px] cursor-pointer"
                      />
                      <span className="text-sm group-hover:text-gray-900">
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Garden Story */}
            <h1 className="text-2xl font-bold">Garden Story</h1>
            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Garden Story <span className="text-orange-500">*</span>
              </h2>
              <p className="text-sm">2-3 sentences each</p>
              <h2 className="font-bold">
                Where is your garden, and who does it serve?
              </h2>

              <div className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-4 items-start mt-4">
                {/* Original Version */}
                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  Original Version
                </div>
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="No original version available"
                    fullWidth
                    multiline
                    value={formData.storyLocationAndAudience}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                </div>

                {/* AI Polished Version */}
                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  AI Polished Version
                </div>
                {/* TODO: Add AI Polished Version */}
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="AI version will appear here"
                    fullWidth
                    multiline
                    value={formData.storyLocationAndAudienceAI}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                </div>

                {/* Final Version */}
                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  Final Version
                </div>
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="Write your final version here..."
                    fullWidth
                    multiline
                    value={formData.storyLocationAndAudienceFinal}
                    onChange={handleChange("storyLocationAndAudienceFinal")}
                  />
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outlined"
                      sx={{ px: 2, py: 0.5, minWidth: 0 }}
                      onClick={() =>
                        console.log(
                          // TODO: Save to database
                          "Saving final story:",
                          formData.storyLocationAndAudienceFinal,
                        )
                      }
                    >
                      Save
                    </Button>
                  </div>
                </div>

                <div className="mt-8 col-span-2">
                  <h2 className="font-bold">
                    What challenge does your garden help address, and why does
                    it matter locally?
                  </h2>
                </div>

                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  Original Version
                </div>
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="No original version available"
                    fullWidth
                    multiline
                    value={formData.storyChallenge}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                </div>

                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  AI Polished Version
                </div>
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="AI version will appear here"
                    fullWidth
                    multiline
                    value={formData.storyChallenge}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                </div>

                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  Final Version
                </div>
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="Write your final version here..."
                    fullWidth
                    multiline
                    value={formData.storyChallenge}
                    onChange={handleChange("storyChallenge")}
                  />
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outlined"
                      sx={{ px: 2, py: 0.5, minWidth: 0 }}
                      onClick={() =>
                        console.log(
                          // TODO: Save to database
                          "Saving final story challenge:",
                          formData.storyChallenge,
                        )
                      }
                    >
                      Save
                    </Button>
                  </div>
                </div>

                <div className="mt-8 col-span-2">
                  <h2 className="font-bold">
                    What happens in the garden during the growing season?
                  </h2>
                </div>

                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  Original Version
                </div>
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="No original version available"
                    fullWidth
                    multiline
                    value={formData.storySeasonActivity}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                </div>

                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  AI Polished Version
                </div>
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="AI version will appear here"
                    fullWidth
                    multiline
                    value={formData.storySeasonActivity}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                </div>

                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  Final Version
                </div>
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="Write your final version here..."
                    fullWidth
                    multiline
                    value={formData.storySeasonActivity}
                    onChange={handleChange("storySeasonActivity")}
                  />
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outlined"
                      sx={{ px: 2, py: 0.5, minWidth: 0 }}
                      onClick={() =>
                        console.log(
                          // TODO: Save to database
                          "Saving final story season activity:",
                          formData.storySeasonActivity,
                        )
                      }
                    >
                      Save
                    </Button>
                  </div>
                </div>

                <div className="mt-8 col-span-2">
                  <h2 className="font-bold">
                    What will this year’s SeedMoney campaign make possible?
                  </h2>
                </div>

                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  Original Version
                </div>
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="No original version available"
                    fullWidth
                    multiline
                    value={formData.storyCampaignImpact}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                </div>

                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  AI Polished Version
                </div>
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="AI version will appear here"
                    fullWidth
                    multiline
                    value={formData.storyCampaignImpact}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                </div>

                <div className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium tracking-wide w-fit mt-1">
                  Final Version
                </div>
                <div className="w-full">
                  <TextField
                    variant="standard"
                    placeholder="Write your final version here..."
                    fullWidth
                    multiline
                    value={formData.storyCampaignImpact}
                    onChange={handleChange("storyCampaignImpact")}
                  />
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outlined"
                      sx={{ px: 2, py: 0.5, minWidth: 0 }}
                      onClick={() =>
                        console.log(
                          // TODO: Save to database
                          "Saving final story campaign impact:",
                          formData.storyCampaignImpact,
                        )
                      }
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Main Photo <span className="text-orange-500">*</span>
              </h2>
              <p className="text-sm">
                Upload one clear, high-quality photo that best represents your
                project. This photo will appear at the top of your campaign
                page.
              </p>
              <img
                src="/seedmoneyTeam.png"
                alt="Seed Money Team"
                className="rounded-lg w-full h-80 object-cover"
              />
              <div className="flex items-center justify-between mt-6 mx-2 mb-2">
                <div className="flex items-center gap-3">
                  <UploadFile sx={{ color: "#1976D2", fontSize: 32 }} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      document_file_name.pdf
                    </span>
                    <span className="text-[13px] text-gray-500 flex items-center">
                      100kb <span className="text-[10px] mx-1.5">&bull;</span>{" "}
                      Complete
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Delete sx={{ opacity: 0.54, cursor: "pointer" }} />
                  <CheckCircle color="success" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Supporting Photos <span className="text-orange-500">*</span>
              </h2>
              <p className="text-sm">
                You may upload up to five additional photos that help tell your
                garden&apos;s story. <br />
                *Please choose real, authentic photos of your project — for
                example, people working in the garden, harvesting food, learning
                together, or the garden space itself.
                <br /> *Do not upload logos, flyers, graphics, or AI-generated
                images. These photos should reflect real people and real places
                connected to your project.
              </p>
              <div className="relative">
                <Button
                  variant="outlined"
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    px: 1,
                    py: 0.5,
                    minWidth: 0,
                  }}
                >
                  Set as Main Photo
                </Button>
                <img
                  src="/seedmoneyTeam.png"
                  alt="Seed Money Team"
                  className="rounded-lg w-full h-80 object-cover"
                />
                <div className="flex items-center justify-between mt-6 mx-2 mb-2">
                  <div className="flex items-center gap-3">
                    <UploadFile sx={{ color: "#1976D2", fontSize: 32 }} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">
                        document_file_name.pdf
                      </span>
                      <span className="text-[13px] text-gray-500 flex items-center">
                        100kb <span className="text-[10px] mx-1.5">&bull;</span>{" "}
                        Complete
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Delete sx={{ opacity: 0.54, cursor: "pointer" }} />
                    <CheckCircle color="success" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact information */}
            <h1 className="text-2xl font-bold">Contact Information</h1>
            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Organization Information{" "}
                <span className="text-orange-500">*</span>
              </h2>

              <TextField
                variant="standard"
                label="Legal Name of Beneficiary Organization*"
                fullWidth
                value={formData.organizationName}
                onChange={handleChange("organizationName")}
              />

              <TextField
                variant="standard"
                label="EIN or Public-Sector Identifier*"
                fullWidth
                value={formData.organizationIdentifier}
                onChange={handleChange("organizationIdentifier")}
              />
            </div>

            {/* Mailing Address */}
            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Beneficiary Organization Mailing Address{" "}
                <span className="text-orange-500">*</span>
              </h2>

              <TextField
                variant="standard"
                label="Street 1"
                fullWidth
                value={formData.mailingStreet1}
                onChange={handleChange("mailingStreet1")}
              />

              <TextField
                variant="standard"
                label="Street 2"
                fullWidth
                value={formData.mailingStreet2}
                onChange={handleChange("mailingStreet2")}
              />

              <TextField
                variant="standard"
                label="City*"
                fullWidth
                value={formData.mailingCity}
                onChange={handleChange("mailingCity")}
              />

              {/* State / Province */}
              <FormControl variant="standard" fullWidth>
                <InputLabel>State / Province*</InputLabel>
                <Select
                  value={formData.mailingState}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mailingState: e.target.value,
                    }))
                  }
                  label="State / Province*"
                >
                  {US_STATES.map((state) => (
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
                onChange={handleChange("mailingZip")}
              />

              {/* Country */}
              <FormControl variant="standard" fullWidth>
                <InputLabel>Country*</InputLabel>
                <Select
                  value={formData.mailingCountry}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mailingCountry: e.target.value,
                    }))
                  }
                  label="Country*"
                >
                  {COUNTRIES.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Primary Contact Information */}
            <div className="bg-white rounded-2xl border border-black/10 p-6 flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">
                Primary Contact Information{" "}
                <span className="text-orange-500">*</span>
              </h2>

              <TextField
                variant="standard"
                label="First Name*"
                fullWidth
                value={formData.contactFirstName}
                onChange={handleChange("contactFirstName")}
              />

              <TextField
                variant="standard"
                label="Last Name*"
                fullWidth
                value={formData.contactLastName}
                onChange={handleChange("contactLastName")}
              />

              <TextField
                variant="standard"
                label="Email*"
                fullWidth
                value={formData.contactEmail}
                onChange={handleChange("contactEmail")}
              />

              <TextField
                variant="standard"
                label="Role or Title"
                fullWidth
                value={formData.contactRole}
                onChange={handleChange("contactRole")}
              />
            </div>
          </div>

          <div className="w-32 flex flex-col gap-3 pt-1">
            <Button
              variant="contained"
              disabled={!isFormDirty}
              onClick={() => setIsSaveModalOpen(true)}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsCancelModalOpen(true)}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Spacer for bottom scrolling */}
        <div className="h-20" />
      </div>

      {/* Confirm Save Modal */}
      <Dialog
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="text-[#1A4A28] font-bold text-xl">Confirm Edit</span>
          <IconButton
            aria-label="close"
            onClick={() => setIsSaveModalOpen(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="mb-4 text-gray-600">
            You are about to edit this campaign:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-black font-medium">
            <li>Campaign title</li>
            <li>
              Garden story -{" "}
              <strong>Where is your garden, and who does it serve?</strong>
            </li>
          </ul>
          <p className="text-gray-500 text-sm mt-4">
            Changes cannot be reversed unless edit is requested again. Are you
            sure you would like to save changes?
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsSaveModalOpen(false)}
            sx={{ color: "gray", fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // TODO: Save data to backend
              console.log("Saving data:", formData);
              setInitialData(formData);
              setIsSaveModalOpen(false);
              setShowSuccessToast(true);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Cancel Modal */}
      <Dialog
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            pb: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="text-[#1A4A28] font-bold text-xl">Confirm Edit</span>
          <IconButton
            aria-label="close"
            onClick={() => setIsCancelModalOpen(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="mb-4 text-gray-600">
            Are you sure you want to leave this form? Your changes will not be
            saved.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCancelModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setIsCancelModalOpen(false);
              router.push(`/dashboard/ongoing-campaigns/${campaignId}`);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Toast Notification */}
      <Snackbar
        open={showSuccessToast}
        autoHideDuration={4000}
        onClose={() => setShowSuccessToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 1, mr: 1 }}
      >
        <Alert
          icon={
            <CheckCircleOutline fontSize="small" sx={{ color: "#1A4A28" }} />
          }
          severity="success"
        >
          <AlertTitle sx={{ fontSize: "16px" }}>Campaigns Updated!</AlertTitle>
          <span className="text-[14px]">
            You have successfully updated 2 <br />
            campaigns.
          </span>
        </Alert>
      </Snackbar>
    </div>
  );
}
