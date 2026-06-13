type SendCampaignEmailType =
  | "campaign_submitted"
  | "campaign_approved"
  | "campaign_denied";

type SendCampaignEmailInput = {
  type: SendCampaignEmailType;
  campaignId: number;
  context: string;
};

type SendCampaignEmailResult = {
  data: unknown;
  error: unknown;
};

export async function sendCampaignEmailWithLogs({
  type,
  campaignId,
  context,
}: SendCampaignEmailInput): Promise<SendCampaignEmailResult> {
  console.info("[send-campaign-email] requesting API route", {
    context,
    type,
    campaignId,
  });

  const response = await fetch("/api/send-campaign-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      campaign_id: campaignId,
    }),
  });

  const responseText = await response.text();
  let responseBody: unknown = responseText;

  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseBody = responseText;
  }

  if (!response.ok) {
    console.error("[send-campaign-email] API route returned failure", {
      context,
      type,
      campaignId,
      status: response.status,
      responseBody,
    });

    return {
      data: null,
      error: {
        status: response.status,
        responseBody,
      },
    };
  }

  console.info("[send-campaign-email] API route returned success", {
    context,
    type,
    campaignId,
    responseBody,
  });

  return {
    data: responseBody,
    error: null,
  };
}
