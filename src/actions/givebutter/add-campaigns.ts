const getGivebutterEnv = () => {
  const key = process.env.NEXT_GIVEBUTTER_API_KEY;

  if (!key) {
    throw new Error(
      "missing Givebutter env vars, NEXT_GIVEBUTTER_API_KEY must be set",
    );
  }

  return { key };
};

export const addCampaign = async () => {
  const response = await fetch("https://api.givebutter.com/v1/campaigns", {
    headers: {
      Authorization: "Bearer YOUR_API_KEY",
    },
  });
};
