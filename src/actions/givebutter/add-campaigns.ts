const getGivebutterEnv = () => {
  const key = process.env.NEXT_GIVEBUTTER_API_KEY;

  if (!key) {
    throw new Error(
      "missing Givebutter env vars, NEXT_GIVEBUTTER_API_KEY must be set",
    );
  }

  return { key };
};

const payload = {};

export const addCampaign = async () => {
  const key = getGivebutterEnv().key;
  const response = await fetch("https://api.givebutter.com/v1/campaigns", {
    headers: {
      method: "POST",
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};
