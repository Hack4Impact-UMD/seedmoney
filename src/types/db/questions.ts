/** Row shape for the `questions` table (DB columns, snake_case). */
export type DbQuestionRow = {
  id: number;
  question: string;
  is_active: boolean;
  question_number: number;
};
