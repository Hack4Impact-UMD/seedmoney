import type { GivebutterCampaignPayload } from "@/src/types/db/campaigns";

const getGivebutterEnv = () => {
  const key = process.env.NEXT_GIVEBUTTER_API_KEY;

  if (!key) {
    throw new Error(
      "missing Givebutter env vars, NEXT_GIVEBUTTER_API_KEY must be set",
    );
  }

  return { key };
};

export const addCampaign = async (payload: GivebutterCampaignPayload) => {
  const key = getGivebutterEnv().key;
  const response = await fetch("https://api.givebutter.com/v1/campaigns", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Givebutter API error: ${response.status} ${response.statusText}`,
    );
  }

  return data;
};

export const listCampaigns = async (scope?: string) => {
  const key = getGivebutterEnv().key;

  const url = new URL("https://api.givebutter.com/v1/campaigns");
  if (scope) url.searchParams.set("scope", scope);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Givebutter API error: ${response.status} ${response.statusText}`,
    );
  }

  return data;
};

export const getCampaign = async (campaign: number) => {
  const key = getGivebutterEnv().key;

  const url = `https://api.givebutter.com/v1/campaigns/${campaign}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${key}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Givebutter API error: ${response.status} ${response.statusText}`,
    );
  }

  return data;
};

export const updateCampaign = async (
  campaignId: number,
  updates: Partial<GivebutterCampaignPayload>,
) => {
  const key = getGivebutterEnv().key;

  const url = `https://api.givebutter.com/v1/campaigns/${campaignId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Givebutter API error: ${response.status} ${response.statusText}`,
    );
  }

  return data;
};
