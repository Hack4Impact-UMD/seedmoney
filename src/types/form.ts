export interface ApplicationFormData {
  campaignTitle: string;
  beneficiaryCount: string;
  gardenSize: string;
  gardenStatus: "new" | "existing" | "";
  fundraisingGoal: string;
  gardenCity: string;
  gardenState: string;
  gardenCountry: string;
  gardenCategory: string;
  gardenBeneficiaries: string[];
  storyLocationAndAudience: string;
  storyChallenge: string;
  storySeasonActivity: string;
  storyCampaignImpact: string;
  organizationName: string;
  organizationIdentifier: string;
  mailingStreet1: string;
  mailingStreet2: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  mailingCountry: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactRole: string;

  steps: Step[];
}

export type StepStatus = "completed" | "current" | "review" | "unvisited";

export type Step = {
  label: string;
  status: StepStatus;
};
