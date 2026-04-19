export const applicationGardenCategories = [
  "Community Garden",
  "School or Youth Garden",
  "Food Pantry or Food Bank Garden",
  "Urban Farm",
  "Refugee or Immigrant Garden",
  "Tribal or Indigenous Garden Project",
  "Shelter or Transitional Housing Garden",
  "Therapeutic or Healing Garden",
  "Job Training or Vocational Garden",
  "Demonstration or Education Garden",
  "Multi-Site Garden Program",
  "Other (please specify)",
] as const;

export const leaderboardGardenCategories = applicationGardenCategories.filter(
  (category) => category !== "Other (please specify)",
);
