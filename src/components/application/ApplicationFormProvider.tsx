// "use client";

// import { createContext, useContext } from "react";
// import { useForm } from "@tanstack/react-form";
// import type { NewAnswer } from "../../types/db/answers";

// //allow multiples pages to view same form data
// const ApplicationFormContext = createContext<unknown>(null);

// export const ApplicationFormProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   //create tanstack form and state obj to track form vals
//   const form = useForm({
//     defaultValues: {} as NewAnswer,
//   });

//   return (
//     //give all components thbat are wrapped access to same form state
//     <ApplicationFormContext.Provider value={form}>
//       {children}
//     </ApplicationFormContext.Provider>
//   );
// };

// //shortcut to access form easier
// export const useApplicationForm = () => {
//   return useContext(ApplicationFormContext);
// };

"use client";

import { createContext, useContext, ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { Step, StepStatus, ApplicationFormData } from "@/src/types/form";

const INITIAL_STEPS: Step[] = [
  { label: "Grantee Agreement", status: "current" },
  { label: "Campaign Information", status: "unvisited" },
  { label: "Garden Information", status: "unvisited" },
  { label: "Garden Story", status: "unvisited" },
  { label: "Contact Information", status: "unvisited" },
  { label: "Review & Submit", status: "unvisited" },
];

const INITIAL_FORM_VALUES: ApplicationFormData = {
  campaignTitle: "",
  beneficiaryCount: "",
  gardenSize: "",
  gardenStatus: "",
  fundraisingGoal: "",
  gardenCity: "",
  gardenState: "",
  gardenCountry: "US",
  gardenCategory: "",
  gardenBeneficiaries: [],
  storyLocationAndAudience: "",
  storyChallenge: "",
  storySeasonActivity: "",
  storyCampaignImpact: "",
  organizationName: "",
  organizationIdentifier: "",
  mailingStreet1: "",
  mailingStreet2: "",
  mailingCity: "",
  mailingState: "",
  mailingZip: "",
  mailingCountry: "US",
  contactFirstName: "",
  contactLastName: "",
  contactEmail: "",
  contactRole: "",
  steps: INITIAL_STEPS,
};

const useApplicationFormState = () =>
  useForm({
    defaultValues: INITIAL_FORM_VALUES,
    onSubmit: async ({ value }) => {
      console.log("Submitted:", value);
    },
  });

type ApplicationFormApi = ReturnType<typeof useApplicationFormState>;

interface ApplicationFormContextValue {
  form: ApplicationFormApi;
  updateStepStatus: (label: string, newStatus: StepStatus) => void;
  setCurrentStep: (label: string) => void;
}

const ApplicationFormContext =
  createContext<ApplicationFormContextValue | null>(null);

export const ApplicationFormProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const form = useApplicationFormState();

  const updateStepStatus = (label: string, newStatus: StepStatus) => {
    const currentSteps = form.getFieldValue("steps");

    const updatedSteps: Step[] = currentSteps.map((step) =>
      step.label === label ? { ...step, status: newStatus } : step,
    );

    form.setFieldValue("steps", updatedSteps);
  };

  const setCurrentStep = (label: string) => {
    const currentSteps = form.getFieldValue("steps");
    const targetIndex = currentSteps.findIndex((step) => step.label === label);

    if (targetIndex === -1) {
      return;
    }

    const updatedSteps: Step[] = currentSteps.map((step, index) => {
      if (index < targetIndex) {
        return {
          ...step,
          status: step.status === "completed" ? "completed" : "review",
        };
      }

      if (index === targetIndex) {
        return { ...step, status: "current" };
      }

      if (step.status === "current") {
        return { ...step, status: "unvisited" };
      }

      return step;
    });

    form.setFieldValue("steps", updatedSteps);
  };

  return (
    <ApplicationFormContext.Provider
      value={{ form, updateStepStatus, setCurrentStep }}
    >
      {children}
    </ApplicationFormContext.Provider>
  );
};

export const useApplicationForm = () => {
  const context = useContext(ApplicationFormContext);
  if (!context) {
    throw new Error(
      "useApplicationForm must be used within an ApplicationFormProvider",
    );
  }
  return context;
};
