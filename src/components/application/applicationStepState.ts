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

export interface IncompleteCards {
  campaign: string[];
  garden: string[];
  story: string[];
  contact: string[];
}

export function getIncompleteCards(
  values: ApplicationProgressValues,
): IncompleteCards {
  const isFilled = (value: string) => value.trim().length > 0;
  const missing = (cards: { title: string; complete: boolean }[]) =>
    cards.filter((card) => !card.complete).map((card) => card.title);

  return {
    campaign: missing([
      { title: "Campaign Title", complete: isFilled(values.campaignTitle) },
      {
        title: "Project Details & Impact",
        complete:
          isFilled(values.beneficiaryCount) && isFilled(values.gardenStatus),
      },
      { title: "Fundraising Goal", complete: isFilled(values.fundraisingGoal) },
    ]),
    garden: missing([
      {
        title: "Garden Location",
        complete:
          isFilled(values.gardenCity) &&
          isFilled(values.gardenState) &&
          isFilled(values.gardenCountry),
      },
      {
        title: "Primary Project Category",
        complete: isFilled(values.gardenCategory),
      },
      {
        title: "Beneficiary Populations Served",
        complete: values.gardenBeneficiaries.length > 0,
      },
    ]),
    story: missing([
      {
        title: "Garden Story",
        complete:
          hasValidStoryAnswer(values.storyLocationAndAudience) &&
          hasValidStoryAnswer(values.storyChallenge) &&
          hasValidStoryAnswer(values.storySeasonActivity) &&
          hasValidStoryAnswer(values.storyCampaignImpact),
      },
      { title: "Main Photo", complete: isFilled(values.mainPhoto) },
    ]),
    contact: missing([
      {
        title: "Organization Information",
        complete:
          isFilled(values.organizationName) &&
          isFilled(values.organizationIdentifier),
      },
      {
        title: "Beneficiary Organization Mailing Address",
        complete:
          isFilled(values.mailingStreet1) &&
          isFilled(values.mailingCity) &&
          isFilled(values.mailingState) &&
          isFilled(values.mailingZip) &&
          isFilled(values.mailingCountry),
      },
      {
        title: "Primary Contact Information",
        complete:
          isFilled(values.contactFirstName) &&
          isFilled(values.contactLastName) &&
          validateEmail(values.contactEmail.trim()),
      },
    ]),
  };
}

export function formatIncompleteMessage(titles: string[]): string {
  const quoted = titles.map((title) => `"${title}"`);

  if (quoted.length <= 2) {
    return `Please complete ${quoted.join(" and ")}`;
  }

  return `Please complete ${quoted.slice(0, -1).join(", ")}, and ${quoted.at(-1)}`;
}

export function getApplicationCompletionState(
  values: ApplicationProgressValues,
  hasPassedAgreement: boolean,
) {
  const agreementComplete = hasPassedAgreement;
  const incompleteCards = getIncompleteCards(values);

  const campaignComplete = incompleteCards.campaign.length === 0;
  const gardenComplete = incompleteCards.garden.length === 0;
  const storyComplete = incompleteCards.story.length === 0;
  const contactComplete = incompleteCards.contact.length === 0;

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
