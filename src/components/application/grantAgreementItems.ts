export type GrantAgreementItem = {
  text: string;
  required: boolean;
  kind?: "standard" | "aiOptIn";
};

export const GRANT_AGREEMENT_ITEMS: GrantAgreementItem[] = [
  {
    text: "I am not seeking to raise funds for personal use or a personal garden. Funds must benefit a nonprofit or community-serving garden project.*",
    required: true,
  },
  {
    text: "I am applying on behalf of a nonprofit or community-based organization that can document its nonprofit or public-service status.*",
    required: true,
  },
  {
    text: "I understand SeedMoney cannot send funds to personal accounts or via informal transfer services.*",
    required: true,
  },
  {
    text: "I understand international projects must raise at least $50 to be eligible for electronic transfers.*",
    required: true,
  },
  {
    text: "I understand SeedMoney may request a brief progress report if my project receives funding.*",
    required: true,
  },
  {
    text: "I authorize SeedMoney to reuse submitted text and photos for educational or promotional purposes.*",
    required: true,
  },
  {
    text: "I certify that the information provided is accurate and complete.*",
    required: true,
  },
  {
    text: "Optional: I authorize SeedMoney to use AI to proofread and correct errors in my campaign text. Details.",
    required: false,
    kind: "aiOptIn",
  },
];
