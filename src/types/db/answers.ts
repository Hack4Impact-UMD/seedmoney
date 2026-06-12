export type Answers = {
  answer_id: number;
  campaign_id: number;
  question_id: number;
  pre_ai_answer: string;
  ai_answer: string;
  final_answer: string;
};


export type NewAnswer = Omit<Answers, "answer_id" | "ai_answer" | "final_answer"> &
  Partial<Pick<Answers, "ai_answer" | "final_answer">>;
