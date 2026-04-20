import { readCampaign } from "@/src/actions/db/campaigns";
import { Campaign } from "@/src/types/db/campaigns";
import { readAnswersByCampaign } from "@/src/actions/db/answers";
import { readCampaignImagesByCampaign } from "@/src/actions/db/campaign-image-records";
import {
  EditCampaignFormData,
  DEFAULT_CAMPAIGN_DATA,
} from "@/src/types/frontend/campaignEdit";

export async function readCampaignEditInformation(campaignId: number) {
  const [campaignData, answersData, imageRecords] = await Promise.all([
    readCampaign(campaignId) as Promise<Campaign | null>,
    readAnswersByCampaign(campaignId),
    readCampaignImagesByCampaign(campaignId).catch(() => []),
  ]);

  const imageRecords1 = await readCampaignImagesByCampaign(campaignId).catch((err) => {
  console.error("imageRecords fetch failed:", err);
  return [];
});

  const dbCampaign = campaignData as Campaign;
  const answers = answersData;

  const mapAnswer = (questionNumber: number) =>
    answers.find((a: any) => a.questions?.question_number === questionNumber);

  const locAudAns    = mapAnswer(1);
  const challengeAns = mapAnswer(2);
  const seasonAns    = mapAnswer(3);
  const impactAns    = mapAnswer(4);

  const storyQuestions = {
    q1: locAudAns?.questions?.question    ?? "Where is your garden, and who does it serve?",
    q2: challengeAns?.questions?.question ?? "What challenge does your garden help address, and why does it matter locally?",
    q3: seasonAns?.questions?.question    ?? "What happens in the garden during the growing season?",
    q4: impactAns?.questions?.question    ?? "What will this year's SeedMoney campaign make possible?",
  };

  const mappedData: EditCampaignFormData = {
    ...DEFAULT_CAMPAIGN_DATA,
    campaignTitle:          dbCampaign?.name                    ?? "",
    beneficiaryCount:       dbCampaign?.impact?.toString()      ?? "",
    gardenSize:             dbCampaign?.size?.toString()        ?? "",
    gardenStatus:           (dbCampaign?.existence as "new" | "existing") ?? "existing",
    fundraisingGoal:        dbCampaign?.goal?.toString()        ?? "",
    gardenCity:             dbCampaign?.city                    ?? "",
    gardenState:            dbCampaign?.state                   ?? "",
    gardenCountry:          dbCampaign?.country                 ?? "",
    gardenCategory:         dbCampaign?.project_category        ?? "",
    gardenBeneficiaries:    dbCampaign?.project_beneficiaries   ?? [],
    organizationName:       dbCampaign?.organization_name       ?? "",
    organizationIdentifier: dbCampaign?.ein                     ?? "",
    mailingStreet1:         dbCampaign?.mailing_street_1        ?? "",
    mailingStreet2:         dbCampaign?.mailing_street_2        ?? "",
    mailingCity:            dbCampaign?.mailing_city            ?? "",
    mailingState:           dbCampaign?.mailing_state           ?? "",
    mailingCountry:         dbCampaign?.mailing_country         ?? "",
    mailingZip:             dbCampaign?.mailing_zipcode         ?? "",
    contactFirstName:       dbCampaign?.contact_first_name      ?? "",
    contactLastName:        dbCampaign?.contact_last_name       ?? "",
    contactEmail:           dbCampaign?.contact_email           ?? "",
    contactRole:            dbCampaign?.contact_role            ?? "",

    storyLocationAndAudience:      locAudAns?.pre_ai_answer ?? "",
    storyLocationAndAudienceAI:    locAudAns?.ai_answer     ?? "",
    storyLocationAndAudienceFinal: locAudAns?.final_answer  ?? "",

    storyChallengeOriginal: challengeAns?.pre_ai_answer ?? "",
    storyChallengeAI:       challengeAns?.ai_answer     ?? "",
    storyChallengeFinal:    challengeAns?.final_answer  ?? "",

    storySeasonActivityOriginal: seasonAns?.pre_ai_answer ?? "",
    storySeasonActivityAI:       seasonAns?.ai_answer     ?? "",
    storySeasonActivityFinal:    seasonAns?.final_answer  ?? "",

    storyCampaignImpactOriginal: impactAns?.pre_ai_answer ?? "",
    storyCampaignImpactAI:       impactAns?.ai_answer     ?? "",
    storyCampaignImpactFinal:    impactAns?.final_answer  ?? "",

    imageRecords: imageRecords ?? [],
  };

  return { mappedData, storyQuestions, answersData: answers };
}