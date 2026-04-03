"use client";

import React from "react";

export interface EditCampaignFormData {
  campaignTitle: string;
  beneficiaryCount: string;
  gardenSize: string;
  gardenStatus: "new" | "existing";
  fundraisingGoal: string;
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
}

export type TextFieldKey = {
  [K in keyof EditCampaignFormData]: EditCampaignFormData[K] extends string
    ? K
    : never;
}[keyof EditCampaignFormData];

export type TextChangeHandler = (
  field: TextFieldKey,
) => (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
) => void;

export type SetFieldValue = <K extends keyof EditCampaignFormData>(
  field: K,
  value: EditCampaignFormData[K],
) => void;
