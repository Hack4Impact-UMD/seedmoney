/** Application/UI-friendly question model (camelCase). */
export type Question = {
  id: number;
  question: string;
  isActive: boolean;
  questionNumber: number;
};

/** Application/UI-friendly answer model (camelCase). */
export type Answer = {
  answerId: number;
  campaignId: number;
  questionId: number;
  preAiAnswer: string;
  aiAnswer: string;
  finalAnswer: string;
};
