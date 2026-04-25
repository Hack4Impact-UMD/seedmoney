"use server";
import { GivebutterCampaignPayload } from "@/src/types";
import { updateCampaign } from "../db/campaigns";

export async function createCampaign(campaignData: Pick<GivebutterCampaignPayload, "title" | "goal" | "end_at" | "description" | "cover">) {
  const { title, description, goal, end_at, cover } = campaignData;

  const body = {
    type: "fundraise",
    title,
    ...(cover        !== undefined && { cover }),
    ...(description  !== undefined && { description }),
    ...(goal         !== undefined && { goal }),
    ...(end_at       !== undefined && { end_at }),
  };

  const createResponse = await fetch("https://api.givebutter.com/v1/campaigns", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GIVEBUTTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(`Failed to create campaign (${createResponse.status}): ${JSON.stringify(error)}`);
  }

  let campaign = await createResponse.json();

  const patchResponse = await fetch(`https://api.givebutter.com/v1/campaigns/${campaign.id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${process.env.GIVEBUTTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ published: 0 }),
  });

  if (!patchResponse.ok) {
    const error = await patchResponse.json();
    throw new Error(`Failed to update campaign (${patchResponse.status}): ${JSON.stringify(error)}`);
  }

  campaign = await patchResponse.json();

  
  return campaign;
}