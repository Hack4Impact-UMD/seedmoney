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
import { useForm, type FormApi } from "@tanstack/react-form";
import { Step, StepStatus, ApplicationFormData } from "@/src/types/form";

const INITIAL_STEPS: Step[] = [
  { label: "Grantee Agreement", status: "current" },
  { label: "Campaign Information", status: "unvisited" },
  { label: "Garden Information", status: "unvisited" },
  { label: "Garden Story", status: "unvisited" },
  { label: "Contact Information", status: "unvisited" },
  { label: "Review & Submit", status: "unvisited" },
];

interface ApplicationFormContextValue {
  form: FormApi<ApplicationFormData, any>;
  updateStepStatus: (label: string, newStatus: StepStatus) => void;
}

const ApplicationFormContext =
  createContext<ApplicationFormContextValue | null>(null);

export const ApplicationFormProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const form = useForm<ApplicationFormData>({
    defaultValues: {
      campaignTitle: "",
      beneficiaryCount: "",
      gardenSize: "",
      gardenStatus: "",
      fundraisingGoal: "",
      steps: INITIAL_STEPS,
    },
    onSubmit: async ({ value }) => {
      console.log("Submitted:", value);
    },
  });

  const updateStepStatus = (label: string, newStatus: StepStatus) => {
    // Get the current steps from the form state
    const currentSteps = form.getFieldValue("steps");

    const updatedSteps = currentSteps.map((step) =>
      step.label === label ? { ...step, status: newStatus } : step,
    );

    // Update the form state with the new steps array
    form.setFieldValue("steps", updatedSteps);
  };

  return (
    <ApplicationFormContext.Provider value={{ form, updateStepStatus }}>
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
