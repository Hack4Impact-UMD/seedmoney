import { ApplicationFormProvider } from "@/src/components/application/ApplicationFormProvider";
import AuthProvider from "@/src/context/AuthProvider";
import { createServerClient } from "@/src/lib/supabase-client";
import { readCurrentDraftCampaignForUser } from "@/src/actions/db/campaigns";
import { ApplicationFormData } from "@/src/types/form";
import { readAnswersByCampaign } from "@/src/actions/db/answers";
import { readCampaignImagesByCampaign } from "@/src/actions/db/campaign-image-records";

export default async function ApplyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  const draftCampaign = userId
    ? await readCurrentDraftCampaignForUser(userId)
    : null;
  const [draftAnswers, draftImages] = draftCampaign
    ? await Promise.all([
        readAnswersByCampaign(draftCampaign.campaign_id),
        readCampaignImagesByCampaign(draftCampaign.campaign_id),
      ])
    : [[], []];

  const storyAnswersByQuestionId = new Map(
    draftAnswers.map((answer) => [
      answer.question_id,
      answer.pre_ai_answer || answer.final_answer,
    ]),
  );
  const mainImage = draftImages.find((image) => image.is_main) ?? null;
  const supportingImages = draftImages.filter((image) => !image.is_main);

  const initialFormValues: Partial<ApplicationFormData> = draftCampaign
    ? {
        aiOptIn: draftCampaign.opt_in_ai ?? false,
        campaignTitle: draftCampaign.name ?? "",
        beneficiaryCount:
          draftCampaign.impact !== null && draftCampaign.impact !== undefined
            ? String(draftCampaign.impact)
            : "",
        gardenSize:
          draftCampaign.size !== null && draftCampaign.size !== undefined
            ? String(draftCampaign.size)
            : "",
        gardenStatus: draftCampaign.existence ?? "",
        fundraisingGoal:
          draftCampaign.goal !== null && draftCampaign.goal !== undefined
            ? String(draftCampaign.goal)
            : "",
        gardenCity: draftCampaign.city ?? "",
        gardenState: draftCampaign.state ?? "",
        gardenCountry: draftCampaign.country ?? "",
        gardenCategory: draftCampaign.project_category ?? "",
        gardenBeneficiaries: draftCampaign.project_beneficiaries ?? [],
        storyLocationAndAudience: storyAnswersByQuestionId.get(1) ?? "",
        storyChallenge: storyAnswersByQuestionId.get(2) ?? "",
        storySeasonActivity: storyAnswersByQuestionId.get(3) ?? "",
        storyCampaignImpact: storyAnswersByQuestionId.get(4) ?? "",
        mainPhoto: mainImage?.signedUrl ?? "",
        mainPhotoStoragePath: mainImage?.storage_path ?? "",
        mainPhotoName: mainImage?.fileName ?? "",
        mainPhotoSize: mainImage?.fileSize ?? 0,
        supportingPhotos: supportingImages.map((image) => image.signedUrl),
        supportingPhotoStoragePaths: supportingImages.map(
          (image) => image.storage_path,
        ),
        supportingPhotoNames: supportingImages.map((image) => image.fileName),
        supportingPhotoSizes: supportingImages.map((image) => image.fileSize),
        organizationName: draftCampaign.organization_name ?? "",
        organizationIdentifier: draftCampaign.ein ?? "",
        mailingStreet1: draftCampaign.mailing_street_1 ?? "",
        mailingStreet2: draftCampaign.mailing_street_2 ?? "",
        mailingCity: draftCampaign.mailing_city ?? "",
        mailingState: draftCampaign.mailing_state ?? "",
        mailingZip: draftCampaign.mailing_zipcode ?? "",
        mailingCountry: draftCampaign.mailing_country ?? "",
        contactFirstName: draftCampaign.contact_first_name ?? "",
        contactLastName: draftCampaign.contact_last_name ?? "",
        contactEmail: draftCampaign.contact_email ?? "",
        contactRole: draftCampaign.contact_role ?? "",
      }
    : {};

  return (
    <div className="bg-[#F6FAF9] min-h-screen flex flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <AuthProvider initialUser={user ?? null}>
          <ApplicationFormProvider
            initialDraftCampaignId={draftCampaign?.campaign_id ?? null}
            initialFormValues={initialFormValues}
            initialHasPassedAgreement={Boolean(draftCampaign)}
          >
            {children}
          </ApplicationFormProvider>
        </AuthProvider>
      </div>
    </div>
  );
}
