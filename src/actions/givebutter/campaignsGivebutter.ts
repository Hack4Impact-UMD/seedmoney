
"use server";
import { GivebutterCampaignPayload } from "@/src/types";

export async function createCampaign(campaignData: Pick<GivebutterCampaignPayload, "title" | "goal" | "end_at" | "description" | "cover">) {
  const {title, description, goal, end_at, cover } = campaignData;

  const body = {
    type: "fundraise",
    title,
    ...(cover         !== undefined && { cover }),
    ...(description  !== undefined && { description }),
    ...(goal         !== undefined && { goal }),
    ...(end_at       !== undefined && { end_at }),
  };

  const response = await fetch("https://api.givebutter.com/v1/campaigns", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GIVEBUTTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create campaign (${response.status}): ${JSON.stringify(error)}`);
  }

  return response.json();
}