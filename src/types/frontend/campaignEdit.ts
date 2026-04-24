"use client";

import React from "react";
import { HydratedCampaignImageRecord } from "@/src/types/db/campaignImageRecords"
import { Status } from "@/src/types/db/enums";


export type CampaignEditInformation = {
  mappedData: EditCampaignFormData;
  storyQuestions: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
  };
};

export interface EditCampaignFormData {
  campaignTitle: string;
  beneficiaryCount: string;
  gardenSize: string;
  gardenStatus: "new" | "existing";
  fundraisingGoal: string;
  status: Status;
  gardenCity: string;
  gardenState: string;
  gardenCountry: string;
  gardenCategory: string;
  gardenBeneficiaries: string[];
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
  storyLocationAndAudience: string;
  storyLocationAndAudienceAI: string;
  storyLocationAndAudienceFinal: string;
  storyLocationAndAudienceQuestionId: number | null;
  storyChallengeOriginal: string;
  storyChallengeAI: string;
  storyChallengeFinal: string;
  storyChallengeQuestionId: number | null;
  storySeasonActivityOriginal: string;
  storySeasonActivityAI: string;
  storySeasonActivityFinal: string;
  storySeasonActivityQuestionId: number | null;
  storyCampaignImpactOriginal: string;
  storyCampaignImpactAI: string;
  storyCampaignImpactFinal: string;
  storyCampaignImpactQuestionId: number | null;
  imageRecords: HydratedCampaignImageRecord[];
}

export const DEFAULT_CAMPAIGN_DATA: EditCampaignFormData = {
  campaignTitle: "",
  beneficiaryCount: "",
  gardenSize: "",
  gardenStatus: "existing",
  status: "pending",
  fundraisingGoal: "",
  gardenCity: "",
  gardenState: "",
  gardenCountry: "",
  gardenCategory: "",
  gardenBeneficiaries: [],
  organizationName: "",
  organizationIdentifier: "",
  mailingStreet1: "",
  mailingStreet2: "",
  mailingCity: "",
  mailingState: "",
  mailingZip: "",
  mailingCountry: "",
  contactFirstName: "",
  contactLastName: "",
  contactEmail: "",
  contactRole: "",
  storyLocationAndAudience: "",
  storyLocationAndAudienceAI: "",
  storyLocationAndAudienceFinal: "",
  storyLocationAndAudienceQuestionId: null,
  storyChallengeOriginal: "",
  storyChallengeAI: "",
  storyChallengeFinal: "",
  storyChallengeQuestionId: null,
  storySeasonActivityOriginal: "",
  storySeasonActivityAI: "",
  storySeasonActivityFinal: "",
  storySeasonActivityQuestionId: null,
  storyCampaignImpactOriginal: "",
  storyCampaignImpactAI: "",
  storyCampaignImpactFinal: "",
  storyCampaignImpactQuestionId: null,
  imageRecords: [],
};


export type TextFieldKey = {
  [K in keyof EditCampaignFormData]: EditCampaignFormData[K] extends string
    ? K
    : never;
}[keyof EditCampaignFormData];

export type TextChangeHandler = (
  field: TextFieldKey,
) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

export type SetFieldValue = <K extends keyof EditCampaignFormData>(
  field: K,
  value: EditCampaignFormData[K],
) => void;
