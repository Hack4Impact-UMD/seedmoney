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
  useMemo,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { useForm } from "@tanstack/react-form";
import { ApplicationFormData } from "@/src/types/form";
import { GRANT_AGREEMENT_ITEMS } from "@/src/components/application/grantAgreementItems";

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

const ApplicationFormContext = createContext<ApplicationFormApi | null>(null);
const AgreementSelectionsContext =
  createContext<AgreementSelectionsContextValue | null>(null);

export const ApplicationFormProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const form = useApplicationFormState();
  const [agreementSelections, setAgreementSelections] = useState<boolean[]>(() =>
    GRANT_AGREEMENT_ITEMS.map(() => false),
  );

  const agreementSelectionsValue = useMemo(
    () => ({
      agreementSelections,
      setAgreementSelections,
    }),
    [agreementSelections],
  );

  return (
    <ApplicationFormContext.Provider value={form}>
      <AgreementSelectionsContext.Provider value={agreementSelectionsValue}>
        {children}
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
