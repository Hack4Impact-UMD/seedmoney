export type Question = {
  question_id: number;
  question: string;
  is_active: boolean;
  question_number: number;
};

export type NewQuestion = Omit<Question, "question_id">;
