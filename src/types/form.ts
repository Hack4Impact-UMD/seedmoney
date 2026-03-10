export interface ApplicationFormData {
  campaignTitle: string;
  beneficiaryCount: string;
  gardenSize: string;
  gardenStatus: "new" | "existing" | "";
  fundraisingGoal: string;

  steps: Step[];
}

export type StepStatus = "completed" | "current" | "review" | "unvisited";

export type Step = {
  label: string;
  status: StepStatus;
};
