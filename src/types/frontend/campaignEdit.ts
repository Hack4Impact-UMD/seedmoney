"use client";

import React from "react";
import { HydratedCampaignImageRecord } from "@/src/types/db/campaignImageRecords"
import { Status } from "@/src/types/db/enums";
import type { AnswerWithQuestion } from "@/src/actions/db/answers";


export type CampaignEditInformation = {
  mappedData: EditCampaignFormData;
  storyQuestions: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
  };
  answersData: AnswerWithQuestion[];
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
  storyChallengeOriginal: string;
  storyChallengeAI: string;
  storyChallengeFinal: string;
  storySeasonActivityOriginal: string;
  storySeasonActivityAI: string;
  storySeasonActivityFinal: string;
  storyCampaignImpactOriginal: string;
  storyCampaignImpactAI: string;
  storyCampaignImpactFinal: string;
  imageRecords: HydratedCampaignImageRecord[];
}

export const DEFAULT_CAMPAIGN_DATA: EditCampaignFormData = {
  campaignTitle: "",
  beneficiaryCount: "",
  gardenSize: "",
  gardenStatus: "existing",
  status: "submitted_under_review",
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
  storyChallengeOriginal: "",
  storyChallengeAI: "",
  storyChallengeFinal: "",
  storySeasonActivityOriginal: "",
  storySeasonActivityAI: "",
  storySeasonActivityFinal: "",
  storyCampaignImpactOriginal: "",
  storyCampaignImpactAI: "",
  storyCampaignImpactFinal: "",
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
