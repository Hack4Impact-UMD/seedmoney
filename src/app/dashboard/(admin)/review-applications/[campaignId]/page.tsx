"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  notFound,
  useParams,
  useRouter,
} from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  MenuItem,
  Radio,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import Navbar from "@/src/components/Navbar";
import {
  getReviewApplicationById,
  notifyReviewApplicationStatusChange,
  updateReviewApplicationStatus,
} from "@/src/app/dashboard/(admin)/review-applications/mockReviewApplications";

type ModalType = "approve" | "deny" | "unsaved" | null;
type ToastType = "approve" | "deny" | null;

type ReviewSectionCardProps = {
  children: React.ReactNode;
  subtitle?: React.ReactNode;
  title: string;
};

type EditableFieldProps = {
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  rows?: number;
  value: string;
};

type StoryEditorProps = {
  finalValue: string;
  onChange: (value: string) => void;
  originalValue: string;
  prompt: string;
};

const fieldSx = {
  "& .MuiInputBase-root": {
    fontSize: 16,
    paddingTop: 1.5,
  },
  "& .MuiInputLabel-root": {
    color: "#8b938d",
    fontSize: 13,
    transform: "translate(0, -1px) scale(0.85)",
  },
  "& .MuiInput-underline:before": {
    borderBottomColor: "#cfd6cf",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#2D7A45",
  },
};

const sectionCardSx = {
  borderRadius: "18px",
  borderColor: "#dfe8df",
  boxShadow: "0 8px 24px rgba(31,60,44,0.05)",
};

const sectionHeadingSx = {
  color: "#1e2320",
  fontSize: 28,
  fontWeight: 700,
  mb: 2,
  lineHeight: 1.15,
};

const selectionControlSx = {
  color: "#b7c1b8",
  "&.Mui-checked": {
    color: "#1976D2",
  },
};

const initialReviewData = {
  aiStory:
    "The Full Belly Community Garden in Scarborough, Maine, provides over 300 pounds of organic produce annually to local food-insecure families and seniors. Beyond its harvest, it serves as an educational hub for at-risk youth and neighbors through nature exploration and hands-on workshops.",
  beneficiaries: [
    "Children (ages 0-12)",
    "Families",
    "Seniors / Older adults",
    "Food-insecure individuals or households",
  ],
  city: "Scarborough",
  contactEmail: "rogerdoiron@gmail.com",
  contactFirstName: "Roger",
  contactLastName: "Doiron",
  contactRole: "Director",
  country: "United States",
  ein: "81-9345210",
  fundraisingGoal: "600",
  gardenSize: "2000",
  impactCount: "250",
  isExistingGarden: true,
  locationStreet1: "123 Scarborough Dr",
  locationStreet2: "",
  organizationName: "Fully Belly Community Garden",
  projectCategory: "Community Garden",
  state: "Maine",
  storyChallenge:
    "The Full Belly Community Garden addresses the challenge of food insecurity, specifically the difficulty many local families and seniors face in accessing fresh, affordable organic produce.",
  storyGrowingSeason:
    "During the growing season, the garden becomes a vibrant oasis where volunteers host monthly workshops, teach hands-on gardening skills, and create a safe place for at-risk youth to explore nature.",
  storyLocation:
    "The Full Belly Community Garden in Scarborough, Maine, provides over 300 pounds of produce annually to local food-insecure families and seniors. Beyond its harvest, it serves as an educational hub for at-risk youth and neighbors through nature exploration and hands-on workshops.",
  zipcode: "98921",
};

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

const projectCategoryOptions = [
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

function ReviewSectionCard({
  children,
  subtitle,
  title,
}: ReviewSectionCardProps) {
  return (
    <Card variant="outlined" sx={sectionCardSx}>
      <CardContent sx={{ p: 3.5 }}>
        <Typography
          sx={{ color: "#1f2320", fontSize: 18, fontWeight: 700, mb: 0.25 }}
        >
          {title}
          <Box component="span" sx={{ color: "#f4a13e", ml: 0.5 }}>
            *
          </Box>
        </Typography>
        {subtitle && (
          <Typography sx={{ color: "#626963", fontSize: 13, mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

function EditableField({
  label,
  multiline = false,
  onChange,
  rows,
  value,
}: EditableFieldProps) {
  return (
    <TextField
      fullWidth
      label={label}
      multiline={multiline}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      slotProps={{ inputLabel: { shrink: true } }}
      value={value}
      variant="standard"
      sx={fieldSx}
    />
  );
}

function StoryEditor({
  finalValue,
  onChange,
  originalValue,
  prompt,
}: StoryEditorProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ color: "#1f2320", fontSize: 15, fontWeight: 700, mb: 2 }}>
        {prompt}
      </Typography>
      <Stack spacing={2}>
        {[
          { editable: false, label: "Original Version", value: originalValue },
          { editable: false, label: "AI Polished Version ", value: originalValue },
          { editable: true, label: "Final Version", value: finalValue },
        ].map((entry) => (
          <Stack
            key={entry.label}
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "flex-start" }}
          >
            <Chip
              label={entry.label}
              variant="outlined"
              sx={{
                borderColor: "#d1d9d1",
                color: "#5a625c",
                fontSize: 12,
                height: 30,
                minWidth: 140,
              }}
            />
            <TextField
              fullWidth
              InputProps={{ readOnly: !entry.editable }}
              label={entry.label === "Final Version" ? prompt : " "}
              multiline
              onChange={(event) => onChange(event.target.value)}
              rows={3}
              slotProps={{ inputLabel: { shrink: true } }}
              value={entry.value}
              variant="standard"
              sx={fieldSx}
            />
          </Stack>
        ))}
        <Stack alignItems="flex-end">
          <Button
            size="small"
            variant="outlined"
            sx={{
              borderColor: "#b8c6b9",
              borderRadius: "8px",
              color: "#5c7d61",
              fontSize: 12,
              minWidth: 54,
            }}
          >
            SAVE
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function ActionModal({
  body,
  confirmLabel,
  onClose,
  onConfirm,
  secondaryLabel,
  onSecondaryAction,
  title,
}: {
  body: React.ReactNode;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
  onSecondaryAction?: () => void;
  secondaryLabel?: string;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-[rgba(31,41,35,0.24)]">
      <div className="ml-[240px] flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-[760px] rounded bg-white shadow-[0_18px_48px_rgba(0,0,0,0.2)]">
          <div className="flex items-start justify-between px-10 pb-2 pt-8">
            <h3 className="text-[18px] font-semibold text-[#214E34]">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-[#7d8480] transition-colors hover:bg-[#f2f4f2]"
              aria-label="Close dialog"
            >
              <CloseOutlinedIcon />
            </button>
          </div>

          <div className="px-10 pb-8 pt-4 text-[14px] text-[#727873]">{body}</div>

          <div className="flex items-center justify-end gap-4 px-10 pb-8">
            <button
              type="button"
              onClick={onSecondaryAction ?? onClose}
              className="px-2 py-2 text-[14px] font-semibold text-[#6e7570]"
            >
              {secondaryLabel ?? "CANCEL"}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-[12px] bg-[#2D7A45] px-5 py-3 text-[13px] font-semibold text-white"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadedPhotoCard({
  showSetAsMain = true,
  title,
}: {
  showSetAsMain?: boolean;
  title: string;
}) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        sx={{
          overflow: "hidden",
          borderRadius: "10px",
          border: "1px solid #dfe7df",
          mb: 1.5,
          position: "relative",
        }}
      >
        {showSetAsMain && (
          <Box
            sx={{
              position: "absolute",
              left: 12,
              top: 12,
              zIndex: 1,
              border: "1px solid #98b79b",
              borderRadius: "8px",
              bgcolor: "white",
              color: "#4f7e55",
              fontSize: 11,
              fontWeight: 700,
              px: 1,
              py: 0.5,
            }}
          >
            SET AS MAIN PHOTO
          </Box>
        )}
        <Image
          alt={title}
          height={420}
          src="/seedmoneyTeam.png"
          style={{ display: "block", height: "auto", width: "100%" }}
          width={840}
        />
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <UploadFileIcon sx={{ color: "#4a7fe3", fontSize: 18, mt: 0.4 }} />
          <Box>
            <Typography sx={{ color: "#4a514c", fontSize: 14 }}>
              document_file_name.pdf
            </Typography>
            <Typography sx={{ color: "#89918b", fontSize: 12 }}>
              100kb • Complete
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <DeleteIcon sx={{ color: "#5f665f", fontSize: 18 }} />
          <CheckIcon sx={{ color: "#63a46b", fontSize: 18 }} />
        </Stack>
      </Stack>
    </Box>
  );
}

export default function CampaignReviewPage() {
  const params = useParams<{ campaignId: string }>();
  const router = useRouter();
  const application = getReviewApplicationById(Number(params.campaignId));
  const [formData, setFormData] = useState(() => ({
    ...initialReviewData,
    campaignTitle: application?.campaignTitle ?? initialReviewData.organizationName,
    organizationName: application?.campaignTitle ?? initialReviewData.organizationName,
  }));
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toast, setToast] = useState<ToastType>(null);

  if (!application) {
    notFound();
  }

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify({
      ...initialReviewData,
      campaignTitle: application.campaignTitle,
      organizationName: application.campaignTitle,
    });
  }, [application.campaignTitle, formData]);

  const handleFieldChange = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleBackClick = () => {
    if (isDirty) {
      setActiveModal("unsaved");
      return;
    }

    router.push("/dashboard/review-applications");
  };

  const handleConfirmAction = () => {
    if (activeModal === "unsaved") {
      router.push("/dashboard/review-applications");
      return;
    }

    if (activeModal === "approve" || activeModal === "deny") {
      updateReviewApplicationStatus(
        [application.campaignId],
        activeModal === "approve" ? "APPROVED" : "DENIED",
      );
      notifyReviewApplicationStatusChange();
      setToast(activeModal);
      setActiveModal(null);
      window.setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fbf8]">
      <Navbar
        campaigns={[]}
        selectedCampaignId={0}
        onCampaignSelect={() => {}}
      />

      <main className="flex-1 px-6 py-8 sm:px-10 md:px-12">
        <div className="mx-auto max-w-[1120px]">
          {toast && (
            <div className="fixed right-8 top-8 z-30 flex justify-end">
              <div className="flex min-w-[300px] max-w-[340px] items-start gap-3 rounded-sm bg-[#f4fbf2] px-4 py-3 text-[#3b5a40] shadow-[0_8px_24px_rgba(74,107,79,0.08)]">
                <CheckCircleOutlinedIcon className="mt-0.5 !h-5 !w-5 text-[#5f9e68]" />
                <div>
                  <p className="text-[14px] font-semibold">
                    {toast === "approve" ? "Campaign Approved!" : "Campaign Denied!"}
                  </p>
                  <p className="mt-1 text-[13px] leading-5">
                    {toast === "approve"
                      ? "You have successfully approved this campaign."
                      : "You have successfully denied this campaign."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="relative z-20 flex flex-col gap-4 pb-6">
            <div>
              <Typography
                sx={{
                  color: "#214E34",
                  fontSize: { xs: 30, md: 38 },
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                  mb: 2,
                }}
              >
                Review Campaigns - {application.campaignTitle}
              </Typography>

              <button
                type="button"
                onClick={handleBackClick}
                className="inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.05em] text-[#69736b] cursor-pointer"
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
                Back
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <div className="min-w-0 flex-1">
              <Stack spacing={5}>
            <Box>
              <Typography sx={sectionHeadingSx}>
                Campaign Information
              </Typography>
              <Stack spacing={2}>
                <ReviewSectionCard
                  subtitle="The name of your garden, e.g. Fairview Community Garden, Pleasantville Primary School Garden, Holy Jalapeno Church Garden, etc."
                  title="Campaign Title"
                >
                  <EditableField
                    label="Campaign Title"
                    value={formData.campaignTitle}
                    onChange={(value) => handleFieldChange("campaignTitle", value)}
                  />
                </ReviewSectionCard>

                <ReviewSectionCard title="Project Details & Impact">
                  <Stack spacing={3}>
                    <EditableField
                      label="About how many people will benefit from this garden this year?"
                      value={formData.impactCount}
                      onChange={(value) => handleFieldChange("impactCount", value)}
                    />

                    <Box>
                      <Typography sx={{ color: "#1f2320", fontSize: 14, fontWeight: 700, mb: 1 }}>
                        Is this a new or existing garden?
                      </Typography>
                      <Stack spacing={0.5}>
                        <FormControlLabel
                          control={
                            <Radio
                              checked={!formData.isExistingGarden}
                              onChange={() =>
                                handleFieldChange("isExistingGarden", false)
                              }
                              sx={selectionControlSx}
                            />
                          }
                          label="New garden"
                          sx={{ ml: -0.5 }}
                        />
                        <FormControlLabel
                          control={
                            <Radio
                              checked={formData.isExistingGarden}
                              onChange={() =>
                                handleFieldChange("isExistingGarden", true)
                              }
                              sx={selectionControlSx}
                            />
                          }
                          label="Existing garden"
                          sx={{ ml: -0.5 }}
                        />
                      </Stack>
                    </Box>

                    <EditableField
                      label="Approximate garden size or scope"
                      value={formData.gardenSize}
                      onChange={(value) => handleFieldChange("gardenSize", value)}
                    />
                  </Stack>
                </ReviewSectionCard>

                <ReviewSectionCard
                  subtitle="Most SeedMoney projects set goals between $500 and $5,000"
                  title="Fundraising Goal"
                >
                  <EditableField
                    label="Fundraising Goal (USD)"
                    value={formData.fundraisingGoal}
                    onChange={(value) => handleFieldChange("fundraisingGoal", value)}
                  />
                </ReviewSectionCard>
              </Stack>
            </Box>

            <Box>
              <Typography sx={sectionHeadingSx}>
                Garden Information
              </Typography>
              <Stack spacing={2}>
                <ReviewSectionCard title="Garden Location">
                  <Stack spacing={2}>
                    <EditableField
                      label="City"
                      value={formData.city}
                      onChange={(value) => handleFieldChange("city", value)}
                    />
                    <TextField
                      fullWidth
                      label="State / Province"
                      select
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={formData.state}
                      variant="standard"
                      sx={fieldSx}
                      onChange={(event) => handleFieldChange("state", event.target.value)}
                    >
                      <MenuItem value="Maine">Maine</MenuItem>
                      <MenuItem value="Maryland">Maryland</MenuItem>
                    </TextField>
                    <TextField
                      fullWidth
                      label="Country"
                      select
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={formData.country}
                      variant="standard"
                      sx={fieldSx}
                      onChange={(event) => handleFieldChange("country", event.target.value)}
                    >
                      <MenuItem value="United States">United States</MenuItem>
                      <MenuItem value="Canada">Canada</MenuItem>
                    </TextField>
                  </Stack>
                </ReviewSectionCard>

                <ReviewSectionCard title="Primary Project Category">
                  <Typography sx={{ color: "#626963", fontSize: 13, mb: 1.5 }}>
                    Select one:
                  </Typography>
                  <Stack spacing={0.5}>
                    {projectCategoryOptions.map((label) => (
                      <FormControlLabel
                        key={label}
                        control={
                          <Radio
                            checked={formData.projectCategory === label}
                            onChange={() => handleFieldChange("projectCategory", label)}
                            sx={selectionControlSx}
                          />
                        }
                        label={label}
                        sx={{ ml: -0.5 }}
                      />
                    ))}
                  </Stack>
                </ReviewSectionCard>

                <ReviewSectionCard title="Beneficiary Populations Served">
                  <Typography sx={{ color: "#626963", fontSize: 13, mb: 1.5 }}>
                    Select all that apply:
                  </Typography>
                  <Stack spacing={0.5}>
                    {beneficiaryOptions.map((label) => (
                      <FormControlLabel
                        key={label}
                        control={
                          <Checkbox
                            checked={formData.beneficiaries.includes(label)}
                            onChange={() =>
                              handleFieldChange(
                                "beneficiaries",
                                formData.beneficiaries.includes(label)
                                  ? formData.beneficiaries.filter((item) => item !== label)
                                  : [...formData.beneficiaries, label],
                              )
                            }
                            sx={selectionControlSx}
                          />
                        }
                        label={label}
                        sx={{ ml: -0.5 }}
                      />
                    ))}
                  </Stack>
                </ReviewSectionCard>
              </Stack>
            </Box>

            <Box>
              <Typography sx={sectionHeadingSx}>
                Garden Story
              </Typography>
              <ReviewSectionCard subtitle="2–3 sentences each" title="Garden Story">
                <StoryEditor
                  finalValue={formData.storyLocation}
                  originalValue={initialReviewData.storyLocation}
                  prompt="Where is your garden, and who does it serve?"
                  onChange={(value) => handleFieldChange("storyLocation", value)}
                />
                <StoryEditor
                  finalValue={formData.storyChallenge}
                  originalValue={initialReviewData.storyChallenge}
                  prompt="What challenge does your garden help address, and why does it matter locally?"
                  onChange={(value) => handleFieldChange("storyChallenge", value)}
                />
                <StoryEditor
                  finalValue={formData.storyGrowingSeason}
                  originalValue={initialReviewData.storyGrowingSeason}
                  prompt="What happens in the garden during the growing season?"
                  onChange={(value) => handleFieldChange("storyGrowingSeason", value)}
                />
              </ReviewSectionCard>
            </Box>

            <Box>
              <ReviewSectionCard
                subtitle="Upload one clear, high-quality photo that best represents your project. This photo will appear at the top of your campaign page."
                title="Main Photo"
              >
                <UploadedPhotoCard showSetAsMain={false} title="Main Photo" />
              </ReviewSectionCard>
              <Box sx={{ height: 16 }} />
              <ReviewSectionCard
                subtitle={
                  <>
                    You may upload up to five additional photos that help tell your
                    garden&apos;s story.
                    <br />
                    *Please choose real, authentic photos of your project — for
                    example, people working in the garden, harvesting food,
                    learning together, or the garden space itself.
                    <br />
                    *Do not upload logos, flyers, graphics, or AI-generated images.
                    These photos should reflect real people and real places
                    connected to your project.
                  </>
                }
                title="Supporting Photos"
              >
                <UploadedPhotoCard title="Supporting Photo 1" />
                <UploadedPhotoCard title="Supporting Photo 2" />
                <UploadedPhotoCard title="Supporting Photo 3" />
              </ReviewSectionCard>
            </Box>

            <Box>
              <Typography sx={sectionHeadingSx}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                <ReviewSectionCard title="Organization Information">
                  <Stack spacing={2}>
                    <EditableField
                      label="Legal Name of Beneficiary Organization"
                      value={formData.organizationName}
                      onChange={(value) => handleFieldChange("organizationName", value)}
                    />
                    <EditableField
                      label="EIN or Public-Sector Identifier"
                      value={formData.ein}
                      onChange={(value) => handleFieldChange("ein", value)}
                    />
                  </Stack>
                </ReviewSectionCard>

                <ReviewSectionCard title="Beneficiary Organization Mailing Address">
                  <Stack spacing={2}>
                    <EditableField
                      label="Street 1"
                      value={formData.locationStreet1}
                      onChange={(value) => handleFieldChange("locationStreet1", value)}
                    />
                    <EditableField
                      label="Street 2"
                      value={formData.locationStreet2}
                      onChange={(value) => handleFieldChange("locationStreet2", value)}
                    />
                    <EditableField
                      label="City"
                      value={formData.city}
                      onChange={(value) => handleFieldChange("city", value)}
                    />
                    <TextField
                      fullWidth
                      label="State / Province"
                      select
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={formData.state}
                      variant="standard"
                      sx={fieldSx}
                      onChange={(event) => handleFieldChange("state", event.target.value)}
                    >
                      <MenuItem value="Maine">Maine</MenuItem>
                      <MenuItem value="Maryland">Maryland</MenuItem>
                    </TextField>
                    <EditableField
                      label="ZIP/Postal Code"
                      value={formData.zipcode}
                      onChange={(value) => handleFieldChange("zipcode", value)}
                    />
                    <TextField
                      fullWidth
                      label="Country"
                      select
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={formData.country}
                      variant="standard"
                      sx={fieldSx}
                      onChange={(event) => handleFieldChange("country", event.target.value)}
                    >
                      <MenuItem value="United States">United States</MenuItem>
                      <MenuItem value="Canada">Canada</MenuItem>
                    </TextField>
                  </Stack>
                </ReviewSectionCard>

                <ReviewSectionCard title="Primary Contact Information">
                  <Stack spacing={2}>
                    <EditableField
                      label="First Name"
                      value={formData.contactFirstName}
                      onChange={(value) => handleFieldChange("contactFirstName", value)}
                    />
                    <EditableField
                      label="Last Name"
                      value={formData.contactLastName}
                      onChange={(value) => handleFieldChange("contactLastName", value)}
                    />
                    <EditableField
                      label="Email"
                      value={formData.contactEmail}
                      onChange={(value) => handleFieldChange("contactEmail", value)}
                    />
                    <EditableField
                      label="Role or Title"
                      value={formData.contactRole}
                      onChange={(value) => handleFieldChange("contactRole", value)}
                    />
                  </Stack>
                </ReviewSectionCard>
              </Stack>
            </Box>
              </Stack>
            </div>

            <aside className="w-full lg:sticky lg:top-8 lg:w-[132px] lg:shrink-0 lg:pt-[92px]">
              <Stack direction="column" spacing={1.25}>
                <Button
                  variant="contained"
                  onClick={() => setActiveModal("approve")}
                  sx={{
                    minHeight: 50,
                    borderRadius: "10px",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    px: 2,
                  }}
                >
                  APPROVE
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setActiveModal("deny")}
                  sx={{
                    minHeight: 50,
                    borderRadius: "10px",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    px: 2,
                  }}
                >
                  DENY
                </Button>
              </Stack>
            </aside>
          </div>
        </div>
      </main>

      {activeModal === "approve" && (
        <ActionModal
          title="Confirm Approval"
          confirmLabel="APPROVE"
          onClose={() => setActiveModal(null)}
          onConfirm={handleConfirmAction}
          secondaryLabel="CANCEL"
          body={
            <>
              <p>You are about to approve this campaign:</p>
              <ul className="mt-2 list-disc pl-6 text-[#222622]">
                <li>{application.campaignTitle}</li>
              </ul>
              <p className="mt-3">
                Are you sure you would like to approve? This action cannot be
                undone.
              </p>
            </>
          }
        />
      )}

      {activeModal === "deny" && (
        <ActionModal
          title="Confirm Denial"
          confirmLabel="DENY"
          onClose={() => setActiveModal(null)}
          onConfirm={handleConfirmAction}
          secondaryLabel="CANCEL"
          body={
            <>
              <p>You are about to deny this campaign:</p>
              <ul className="mt-2 list-disc pl-6 text-[#222622]">
                <li>{application.campaignTitle}</li>
              </ul>
              <p className="mt-3">
                Are you sure you would like to deny? This action cannot be undone.
              </p>
            </>
          }
        />
      )}

      {activeModal === "unsaved" && (
        <ActionModal
          title="Unsaved changes"
          confirmLabel="STAY"
          onClose={() => setActiveModal(null)}
          onConfirm={() => setActiveModal(null)}
          secondaryLabel="LEAVE WITHOUT SAVING"
          onSecondaryAction={() => router.push("/dashboard/review-applications")}
          body={
            <p className="text-[16px]">
              Are you sure you want to leave this form? Your changes will not be
              saved.
            </p>
          }
        />
      )}
    </div>
  );
}
