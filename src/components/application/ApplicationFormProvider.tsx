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

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { useForm } from "@tanstack/react-form";
import { Step, StepStatus, ApplicationFormData } from "@/src/types/form";
import { GRANT_AGREEMENT_ITEMS } from "@/src/components/application/grantAgreementItems";

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

interface AgreementSelectionsContextValue {
  agreementSelections: boolean[];
  setAgreementSelections: (value: SetStateAction<boolean[]>) => void;
}

interface ApplicationStepContextValue {
  updateStepStatus: (label: string, newStatus: StepStatus) => void;
  setCurrentStep: (label: string) => void;
}

const ApplicationFormContext = createContext<ApplicationFormApi | null>(null);
const AgreementSelectionsContext =
  createContext<AgreementSelectionsContextValue | null>(null);
const ApplicationStepContext =
  createContext<ApplicationStepContextValue | null>(null);

export const ApplicationFormProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const form = useApplicationFormState();
  const [agreementSelections, setAgreementSelections] = useState<boolean[]>(() =>
    GRANT_AGREEMENT_ITEMS.map(() => false),
  );

  const updateStepStatus = useCallback((label: string, newStatus: StepStatus) => {
    const currentSteps = form.getFieldValue("steps");

    const updatedSteps: Step[] = currentSteps.map((step) =>
      step.label === label ? { ...step, status: newStatus } : step,
    );

    form.setFieldValue("steps", updatedSteps);
  }, [form]);

  const setCurrentStep = useCallback((label: string) => {
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
  }, [form]);

  const agreementSelectionsValue = useMemo(
    () => ({
      agreementSelections,
      setAgreementSelections,
    }),
    [agreementSelections],
  );

  const applicationStepValue = useMemo(
    () => ({
      updateStepStatus,
      setCurrentStep,
    }),
    [updateStepStatus, setCurrentStep],
  );

  return (
    <ApplicationFormContext.Provider value={form}>
      <AgreementSelectionsContext.Provider value={agreementSelectionsValue}>
        <ApplicationStepContext.Provider value={applicationStepValue}>
          {children}
        </ApplicationStepContext.Provider>
      </AgreementSelectionsContext.Provider>
    </ApplicationFormContext.Provider>
  );
};

export const useApplicationForm = () => {
  const form = useContext(ApplicationFormContext);
  if (!form) {
    throw new Error(
      "useApplicationForm must be used within an ApplicationFormProvider",
    );
  }
  return form;
};

export const useAgreementSelections = () => {
  const context = useContext(AgreementSelectionsContext);
  if (!context) {
    throw new Error(
      "useAgreementSelections must be used within an ApplicationFormProvider",
    );
  }
  return context;
};

export const useApplicationStepNavigation = () => {
  const context = useContext(ApplicationStepContext);
  if (!context) {
    throw new Error(
      "useApplicationStepNavigation must be used within an ApplicationFormProvider",
    );
  }
  return context;
};
