import { createBrowserClient } from "@/src/lib/supabase-client";
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

// Supabase caps each response (max_rows = 1000 in supabase/config.toml), so
// exports page through results until the reported total has been read.
const PAGE_SIZE = 1000;

type PageResult = {
  data: unknown[] | null;
  error: { message: string } | null;
  count: number | null;
};

// Rows are cast to T because without generated DB types Supabase infers
// embedded many-to-one relations (e.g. campaigns) as arrays.
export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult>,
): Promise<T[]> {
  const rows: T[] = [];

  while (true) {
    const from = rows.length;
    const { data, error, count } = await fetchPage(from, from + PAGE_SIZE - 1);

    // Throw instead of returning a partial list: a silently incomplete
    // export is worse than a visible error.
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;

    rows.push(...(data as T[]));

    if (count !== null && rows.length >= count) break;
  }

  return rows;
}

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
          competition_metadata(start_date),
          answers(
            answer_id, question_id, final_answer,
            questions(question_number)
          )
        `,
        { count: "exact" },
      )
      .order("campaign_id", { ascending: true })
      .range(from, to),
  );

  return campaigns.map(
    ({ campaign_members, competition_metadata, answers, ...campaign }) => ({
      ...campaign,
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
