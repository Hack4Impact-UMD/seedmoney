import LoginNavbar from "@/src/components/LoginNavbar";
import { ApplicationFormProvider } from "@/src/components/application/ApplicationFormProvider";
import { createServerClient } from "@/src/lib/supabase-client";
import { readCurrentDraftCampaignForUser } from "@/src/actions/db/campaigns";
import { ApplicationFormData } from "@/src/types/form";

export default async function ApplyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user.id;
  const draftCampaign = userId
    ? await readCurrentDraftCampaignForUser(userId)
    : null;

  const initialFormValues: Partial<ApplicationFormData> = draftCampaign
    ? {
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
        gardenCountry: draftCampaign.country ?? "US",
        gardenCategory: draftCampaign.project_category ?? "",
        gardenBeneficiaries: draftCampaign.project_beneficiaries ?? [],
        organizationName: draftCampaign.organization_name ?? "",
        organizationIdentifier: draftCampaign.ein ?? "",
        mailingStreet1: draftCampaign.mailing_street_1 ?? "",
        mailingStreet2: draftCampaign.mailing_street_2 ?? "",
        mailingCity: draftCampaign.mailing_city ?? "",
        mailingState: draftCampaign.mailing_state ?? "",
        mailingZip: draftCampaign.mailing_zipcode ?? "",
        mailingCountry: draftCampaign.mailing_country ?? "US",
        contactFirstName: draftCampaign.contact_first_name ?? "",
        contactLastName: draftCampaign.contact_last_name ?? "",
        contactEmail: draftCampaign.contact_email ?? "",
        contactRole: draftCampaign.contact_role ?? "",
      }
    : {};

  return (
    <div className="bg-[#F6FAF9] min-h-screen flex flex-col">
      <LoginNavbar session={session} />
      <div className="flex-1 flex flex-col">
        <ApplicationFormProvider
          initialDraftCampaignId={draftCampaign?.campaign_id ?? null}
          initialFormValues={initialFormValues}
          initialHasPassedAgreement={Boolean(draftCampaign)}
        >
          {children}
        </ApplicationFormProvider>
      </div>
    </div>
  );
}
