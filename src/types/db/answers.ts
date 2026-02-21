/** Row shape for the `answers` table (DB columns, snake_case). */
export type DbAnswerRow = {
  answer_id: number;
  campaign_id: number;
  question_id: number;
  pre_ai_answer: string;
  ai_answer: string;
  final_answer: string;
};
