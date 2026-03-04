export type Questions = {
  question_id: number;
  question: string;
  is_active: boolean;
  question_number: number;
};

export type NewQuestions = Omit<Questions, "question_id">