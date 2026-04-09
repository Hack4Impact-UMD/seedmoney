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
  mainPhoto: "",
  mainPhotoName: "",
  mainPhotoSize: 0,
  supportingPhotos: [],
  supportingPhotoNames: [],
  supportingPhotoSizes: [],
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

interface AgreementGateContextValue {
  hasPassedAgreement: boolean;
  setHasPassedAgreement: (value: SetStateAction<boolean>) => void;
}

interface DraftCampaignIdContextValue {
  draftCampaignId: number | null;
  setDraftCampaignId: (value: SetStateAction<number | null>) => void;
}

interface LastSavedContextValue {
  lastSaved: string | null;
  setLastSaved: (value: SetStateAction<string | null>) => void;
}

const ApplicationFormContext = createContext<ApplicationFormApi | null>(null);
const AgreementGateContext = createContext<AgreementGateContextValue | null>(
  null,
);
const DraftCampaignIdContext =
  createContext<DraftCampaignIdContextValue | null>(null);

const LastSavedContext = createContext<LastSavedContextValue | null>(null);

export const ApplicationFormProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const form = useApplicationFormState();
  const [hasPassedAgreement, setHasPassedAgreement] = useState(false);
  const [draftCampaignId, setDraftCampaignId] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const agreementGateValue = useMemo(
    () => ({
      hasPassedAgreement,
      setHasPassedAgreement,
    }),
    [hasPassedAgreement],
  );

  const draftCampaignIdValue = useMemo(
    () => ({
      draftCampaignId,
      setDraftCampaignId,
    }),
    [draftCampaignId],
  );

  const lastSavedValue = useMemo(
    () => ({
      lastSaved,
      setLastSaved,
    }),
    [lastSaved],
  );

  return (
    <ApplicationFormContext.Provider value={form}>
      <AgreementGateContext.Provider value={agreementGateValue}>
        <DraftCampaignIdContext.Provider value={draftCampaignIdValue}>
          <LastSavedContext.Provider value={lastSavedValue}>
            {children}
          </LastSavedContext.Provider>
        </DraftCampaignIdContext.Provider>
      </AgreementGateContext.Provider>
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

export const useAgreementGate = () => {
  const context = useContext(AgreementGateContext);
  if (!context) {
    throw new Error(
      "useAgreementGate must be used within an ApplicationFormProvider",
    );
  }
  return context;
};

export const useDraftCampaignId = () => {
  const context = useContext(DraftCampaignIdContext);
  if (!context) {
    throw new Error(
      "useDraftCampaignId must be used within an ApplicationFormProvider",
    );
  }
  return context;
};

export const useLastSaved = () => {
  const context = useContext(LastSavedContext);
  if (!context) {
    throw new Error(
      "useLastSaved must be used within an ApplicationFormProvider",
    );
  }
  return context;
};
