import { createBrowserClient } from "@/src/lib/supabase-client";

export type ReviewApplicationRow = {
  campaignId: number;
  campaignTitle: string;
  campaignLeader: string;
  raised: number;
  goal: number;
  goalProgress: number;
  status: "submitted_under_review" | "not_approved";
  submissionDate: string;
};

export async function readCampaignsUnderReview(
  competitionId: number,
): Promise<ReviewApplicationRow[]> {
  const supabase = createBrowserClient();

  const { data: campaignsData, error: campaignsError } = await supabase
    .from("campaigns")
    .select(
      "campaign_id, name, raised, goal, status, date_created, campaign_members!inner(role, users!inner(first_name, last_name))",
    )
    .in("status", ["submitted_under_review", "not_approved"])
    .eq("campaign_id.competition_id", competitionId)
    .eq("campaign_members.role", "campaign_leader");

  if (campaignsError) {
    console.error("Error fetching campaigns under review:", campaignsError.message);
    return [];
  }

  const campaigns = (campaignsData ?? []) as {
    campaign_id: number;
    name: string;
    raised: number;
    goal: number;
    status: string;
    date_created: string;
    campaign_members: {
      role: string;
      users: { first_name: string; last_name: string }[];
    }[];
  }[];

  return campaigns.map((c) => {
    // Get all campaign leaders (in case there are multiple)
    const leaders = c.campaign_members
      .filter((m) => m.role === "campaign_leader")
      .flatMap((m) =>
        m.users.map((u) => `${u.first_name} ${u.last_name}`.trim()),
      );

    // Sort alphabetically and get the first one
    const leaderName = leaders.length > 0 ? leaders.sort()[0] : "";

    return {
      campaignId: c.campaign_id,
      campaignTitle: c.name ?? "",
      campaignLeader: leaderName,
      raised: c.raised ?? 0,
      goal: c.goal ?? 0,
      goalProgress: c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 0,
      status: c.status as "submitted_under_review" | "not_approved",
      submissionDate: c.date_created ?? "",
    };
  });
}

