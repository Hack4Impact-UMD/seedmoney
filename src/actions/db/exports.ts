import { createBrowserClient } from "@/src/lib/supabase-client";
import { fetchAllPages } from "@/src/lib/fetchAllPages";
import { getGardenStoryAnswers } from "@/src/lib/givebutterStoryAnswers";
import moment from "moment";
import type { Campaign } from "@/src/types/db/campaigns";
import type { Users } from "@/src/types/db/users";
import type {
  ApplicationExportRow,
  ExportCampaign,
  ExportLeader,
  UserExportRow,
} from "@/src/types/frontend/exports";

export { fetchAllPages };

type UserWithMemberships = Users & {
  campaign_members: {
    role: string | null;
    campaigns: ExportCampaign | null;
  }[];
};

export async function readAllUsersForExport(): Promise<UserExportRow[]> {
  const supabase = createBrowserClient();

  const users = await fetchAllPages<UserWithMemberships>((from, to) =>
    supabase
      .from("users")
      .select(
        `
          id, first_name, middle_name, last_name, email, phone_number,
          is_admin, created_at,
          campaign_members(
            role,
            campaigns(campaign_id, name, status)
          )
        `,
        { count: "exact" },
      )
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to),
  );

  return users.map(({ campaign_members, ...user }) => ({
    ...user,
    led_campaigns: campaign_members
      .filter((member) => member.role === "campaign_leader" && member.campaigns)
      .map((member) => member.campaigns as ExportCampaign),
  }));
}

type CampaignWithRelations = Campaign & {
  campaign_members: {
    role: string | null;
    users: ExportLeader | null;
  }[];
  competition_metadata: { start_date: string } | null;
  answers: Parameters<typeof getGardenStoryAnswers>[0];
  campaign_image_records: {
    id: number;
    storage_path: string;
    display_order: number;
    is_main: boolean;
  }[];
};

export async function readAllApplicationsForExport(): Promise<
  ApplicationExportRow[]
> {
  const supabase = createBrowserClient();

  const campaigns = await fetchAllPages<CampaignWithRelations>((from, to) =>
    supabase
      .from("campaigns")
      .select(
        `
          *,
          campaign_members(
            role,
            users(first_name, last_name, email)
          ),
          competition_metadata!campaigns_competition_id_fkey(start_date),
          answers(
            answer_id, question_id, final_answer,
            questions(question_number)
          ),
          campaign_image_records(id, storage_path, display_order, is_main)
        `,
        { count: "exact" },
      )
      .order("campaign_id", { ascending: true })
      .range(from, to),
  );

  // Permanent links (the app's own signed URLs expire after an hour, which
  // would break links in a saved spreadsheet). Requires the campaign_images
  // bucket to be public.
  const photoBucket = supabase.storage.from("campaign_images");

  return campaigns.map(
    ({
      campaign_members,
      competition_metadata,
      answers,
      campaign_image_records,
      ...campaign
    }) => ({
      ...campaign,
      photos: [...campaign_image_records]
        .sort(
          (a, b) =>
            Number(b.is_main) - Number(a.is_main) ||
            a.display_order - b.display_order,
        )
        .map((photo) => ({
          id: photo.id,
          url: photoBucket.getPublicUrl(photo.storage_path).data.publicUrl,
          is_main: photo.is_main,
        })),
      leader:
        campaign_members.find(
          (member) => member.role === "campaign_leader" && member.users,
        )?.users ?? null,
      competition_year: competition_metadata
        ? moment(competition_metadata.start_date).year()
        : null,
      story_answers: getGardenStoryAnswers(answers),
    }),
  );
}
