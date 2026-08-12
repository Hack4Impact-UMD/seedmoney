type StoryAnswer = {
  answer_id: number;
  question_id: number;
  final_answer: string | null;
  questions: { question_number: number } | null;
};

export function getGardenStoryAnswers(
  answers: readonly StoryAnswer[],
): [string, string, string, string] {
  const latestByQuestionId = new Map<number, StoryAnswer>();

  for (const answer of answers) {
    const latest = latestByQuestionId.get(answer.question_id);

    if (!latest || answer.answer_id > latest.answer_id) {
      latestByQuestionId.set(answer.question_id, answer);
    }
  }

  const latestByQuestionNumber = new Map<number, StoryAnswer>();

  for (const answer of latestByQuestionId.values()) {
    const questionNumber =
      answer.questions?.question_number ?? answer.question_id;

    const latest = latestByQuestionNumber.get(questionNumber);
    if (!latest || answer.answer_id > latest.answer_id) {
      latestByQuestionNumber.set(questionNumber, answer);
    }
  }

  const getAnswer = (questionNumber: number) =>
    latestByQuestionNumber.get(questionNumber)?.final_answer ?? "";

  return [getAnswer(1), getAnswer(2), getAnswer(3), getAnswer(4)];
}
