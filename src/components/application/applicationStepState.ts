import { ApplicationFormData, Step } from "@/src/types/form";

export const APPLICATION_STEPS = [
  { label: "Grantee Agreement", href: "/apply/terms" },
  { label: "Campaign Information", href: "/apply/campaign" },
  { label: "Garden Information", href: "/apply/garden" },
  { label: "Garden Story", href: "/apply/story" },
  { label: "Contact Information", href: "/apply/contact" },
  { label: "Review & Submit", href: "/apply/review" },
] as const;

export type ApplicationProgressValues = Pick<
  ApplicationFormData,
  | "campaignTitle"
  | "beneficiaryCount"
  | "gardenSize"
  | "gardenStatus"
  | "fundraisingGoal"
  | "gardenCity"
  | "gardenState"
  | "gardenCountry"
  | "gardenCategory"
  | "gardenBeneficiaries"
  | "storyLocationAndAudience"
  | "storyChallenge"
  | "storySeasonActivity"
  | "storyCampaignImpact"
  | "mainPhoto"
  | "organizationName"
  | "organizationIdentifier"
  | "mailingStreet1"
  | "mailingStreet2"
  | "mailingCity"
  | "mailingState"
  | "mailingZip"
  | "mailingCountry"
  | "contactFirstName"
  | "contactLastName"
  | "contactEmail"
  | "contactRole"
>;

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hasValidStoryAnswer(value: string): boolean {
  const trimmedLength = value.trim().length;

  return trimmedLength >= 200 && value.length <= 1000;
}

export function getApplicationCompletionState(
  values: ApplicationProgressValues,
  hasPassedAgreement: boolean,
) {
  const agreementComplete = hasPassedAgreement;

  const campaignComplete =
    values.campaignTitle.trim().length > 0 &&
    values.fundraisingGoal.trim().length > 0 &&
    values.beneficiaryCount.trim().length > 0 &&
    values.gardenStatus.trim().length > 0;

  const gardenComplete =
    values.gardenCity.trim().length > 0 &&
    values.gardenState.trim().length > 0 &&
    values.gardenCountry.trim().length > 0 &&
    values.gardenCategory.trim().length > 0 &&
    values.gardenBeneficiaries.length > 0;

  const storyComplete =
    hasValidStoryAnswer(values.storyLocationAndAudience) &&
    hasValidStoryAnswer(values.storyChallenge) &&
    hasValidStoryAnswer(values.storySeasonActivity) &&
    hasValidStoryAnswer(values.storyCampaignImpact) &&
    values.mainPhoto.trim().length > 0;

  const contactComplete =
    values.organizationName.trim().length > 0 &&
    values.organizationIdentifier.trim().length > 0 &&
    values.mailingStreet1.trim().length > 0 &&
    values.mailingCity.trim().length > 0 &&
    values.mailingState.trim().length > 0 &&
    values.mailingZip.trim().length > 0 &&
    values.mailingCountry.trim().length > 0 &&
    values.contactFirstName.trim().length > 0 &&
    values.contactLastName.trim().length > 0 &&
    validateEmail(values.contactEmail.trim());

  const reviewComplete =
    agreementComplete &&
    campaignComplete &&
    gardenComplete &&
    storyComplete &&
    contactComplete;

  return {
    agreementComplete,
    campaignComplete,
    gardenComplete,
    storyComplete,
    contactComplete,
    reviewComplete,
  };
}

export function getDerivedApplicationSteps(
  pathname: string,
  values: ApplicationProgressValues,
  hasPassedAgreement: boolean,
): Step[] {
  const {
    agreementComplete,
    campaignComplete,
    gardenComplete,
    storyComplete,
    contactComplete,
    reviewComplete,
  } = getApplicationCompletionState(values, hasPassedAgreement);

  const currentIndex = APPLICATION_STEPS.findIndex(
    (step) => step.href === pathname,
  );
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  const completionByLabel: Record<
    (typeof APPLICATION_STEPS)[number]["label"],
    boolean
  > = {
    "Grantee Agreement": agreementComplete,
    "Campaign Information": campaignComplete,
    "Garden Information": gardenComplete,
    "Garden Story": storyComplete,
    "Contact Information": contactComplete,
    "Review & Submit": reviewComplete,
  };

  return APPLICATION_STEPS.map((step, index) => {
    if (index === activeIndex) {
      return { label: step.label, status: "current" };
    }

    if (index < activeIndex) {
      return {
        label: step.label,
        status: completionByLabel[step.label] ? "completed" : "review",
      };
    }

    return { label: step.label, status: "unvisited" };
  });
}
