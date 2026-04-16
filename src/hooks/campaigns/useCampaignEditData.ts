import { useState, useEffect, useMemo } from "react";
import useReadCampaign from "@/src/hooks/campaigns/useReadCampaign";
import useReadGardenStoryAnswers from "@/src/hooks/answers/useReadGardenStoryAnswers";
import type { Campaign } from "@/src/types/db/campaigns";
import {
  EditCampaignFormData,
  DEFAULT_CAMPAIGN_DATA,
} from "@/src/components/ongoing-campaigns/edit/types";

export function useCampaignEditData(campaignId: number | null) {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [mappedData, setMappedData] = useState<EditCampaignFormData>(
    DEFAULT_CAMPAIGN_DATA,
  );
  const [storyQuestions, setStoryQuestions] = useState({
    q1: "Where is your garden, and who does it serve?",
    q2: "What challenge does your garden help address, and why does it matter locally?",
    q3: "What happens in the garden during the growing season?",
    q4: "What will this year’s SeedMoney campaign make possible?",
  });

  const { data: campaignData, isLoading: isLoadingCampaign } = useReadCampaign({
    campaignId: campaignId ?? 0,
  });

  const { data: answersData, isLoading: isLoadingAnswers } =
    useReadGardenStoryAnswers(campaignId ?? 0);

  useEffect(() => {
    if (campaignData && answersData && !isDataLoaded) {
      const dbCampaign = campaignData[0] as Campaign;

      const mapAnswer = (questionNumber: number) => {
        return answersData.find(
          (a: any) => a.questions?.question_number === questionNumber,
        );
      };

      const locAudAns = mapAnswer(1);
      const locAudOrg = locAudAns?.pre_ai_answer || "";
      const locAudAI = locAudAns?.ai_answer || "";
      const locAudFinal = locAudAns?.final_answer || "";

      const challengeAns = mapAnswer(2);
      const challengeOrg = challengeAns?.pre_ai_answer || "";
      const challengeAI = challengeAns?.ai_answer || "";
      const challengeFinal = challengeAns?.final_answer || "";

      const seasonAns = mapAnswer(3);
      const seasonOrg = seasonAns?.pre_ai_answer || "";
      const seasonAI = seasonAns?.ai_answer || "";
      const seasonFinal = seasonAns?.final_answer || "";

      const impactAns = mapAnswer(4);
      const impactOrg = impactAns?.pre_ai_answer || "";
      const impactAI = impactAns?.ai_answer || "";
      const impactFinal = impactAns?.final_answer || "";

      setStoryQuestions({
        q1: locAudAns?.questions?.question || "",
        q2: challengeAns?.questions?.question || "",
        q3: seasonAns?.questions?.question || "",
        q4: impactAns?.questions?.question || "",
      });

      const nextMappedData: EditCampaignFormData = {
        ...DEFAULT_CAMPAIGN_DATA,
        campaignTitle: dbCampaign.name || "",
        beneficiaryCount: dbCampaign.impact?.toString() || "",
        gardenSize: dbCampaign.size?.toString() || "",
        gardenStatus:
          (dbCampaign.existence as "new" | "existing") || "existing",
        fundraisingGoal: dbCampaign.goal?.toString() || "",
        gardenCity: dbCampaign.city || "",
        gardenState: dbCampaign.state || "",
        gardenCountry: dbCampaign.country || "",
        gardenCategory: dbCampaign.project_category || "",
        gardenBeneficiaries: dbCampaign.project_beneficiaries || [],
        organizationName: dbCampaign.organization_name || "",
        organizationIdentifier: dbCampaign.ein || "",
        mailingStreet1: dbCampaign.mailing_street_1 || "",
        mailingStreet2: dbCampaign.mailing_street_2 || "",
        mailingCity: dbCampaign.mailing_city || "",
        mailingState: dbCampaign.mailing_state || "",
        mailingCountry: dbCampaign.mailing_country || "",
        mailingZip: dbCampaign.mailing_zipcode || "",
        contactFirstName: dbCampaign.contact_first_name || "",
        contactLastName: dbCampaign.contact_last_name || "",
        contactEmail: dbCampaign.contact_email || "",
        contactRole: dbCampaign.contact_role || "",

        storyLocationAndAudience: locAudOrg,
        storyLocationAndAudienceAI: locAudAI,
        storyLocationAndAudienceFinal: locAudFinal,

        storyChallengeOriginal: challengeOrg,
        storyChallengeAI: challengeAI,
        storyChallengeFinal: challengeFinal,

        storySeasonActivityOriginal: seasonOrg,
        storySeasonActivityAI: seasonAI,
        storySeasonActivityFinal: seasonFinal,

        storyCampaignImpactOriginal: impactOrg,
        storyCampaignImpactAI: impactAI,
        storyCampaignImpactFinal: impactFinal,
      };

      setMappedData(nextMappedData);
      setIsDataLoaded(true);
    }
  }, [campaignData, answersData, isDataLoaded]);

  return {
    mappedData,
    storyQuestions,
    isDataLoaded,
    isLoading: isLoadingCampaign || isLoadingAnswers,
    answersData,
  };
}
