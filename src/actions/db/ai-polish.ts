import OpenAI from "openai";
import {
  createAnswer,
  readAnswerByCampaignAndQuestion,
  updateAnswer,
} from "@/src/actions/db/answers";
import { Answers } from "@/src/types/db/answers";

type PolishQuestionInput = {
  questionId: string;
  questionText: string;
  answerText: string;
};

type PolishQuestionOutput = {
  questionId: string;
  polishedAnswer: string;
};

export async function queryOpenAI(
  questions: PolishQuestionInput[],
): Promise<PolishQuestionOutput[]> {
  if (questions.length === 0) {
    return [];
  }

  const client = new OpenAI({
    maxRetries: 0,
    timeout: 15000,
  });

  const response = await client.responses.create({
    model: "gpt-5.4-mini",
    input: [
      {
        role: "system",
        content: `
You are a copyeditor for SeedMoney, a non-profit that fundraises for community gardens.

You will receive a list of applicant answers to form questions.

For each answer:
- correct objective issues like spelling, grammar, and punctuation
- preserve the applicant's meaning
- preserve the applicant's voice and overall flow
- make only light clarity edits when helpful
- do not add new facts
- do not remove important details
- do not rewrite into a different tone
- return one polished answer for each input answer

Return JSON only.
        `.trim(),
      },
      {
        role: "user",
        content: JSON.stringify({
          questions,
        }),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "polished_campaign_answers",
        strict: true,
        schema: {
          type: "object",
          properties: {
            answers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  questionId: {
                    type: "string",
                  },
                  polishedAnswer: {
                    type: "string",
                  },
                },
                required: ["questionId", "polishedAnswer"],
                additionalProperties: false,
              },
            },
          },
          required: ["answers"],
          additionalProperties: false,
        },
      },
    },
  });

  const parsed = JSON.parse(response.output_text) as {
    answers: PolishQuestionOutput[];
  };

  return parsed.answers;
}

type CreateAIAnswersInput = {
  campaignId: number;
  overwrite?: boolean;
  questions: {
    questionId: number;
    questionText: string;
    originalText: string;
  }[];
};

async function queryOpenAIWithRetry(
  questions: PolishQuestionInput[],
): Promise<PolishQuestionOutput[]> {
  try {
    return await queryOpenAI(questions);
  } catch (error) {
    console.error("Error querying OpenAI, retrying once:", error);
  }

  try {
    return await queryOpenAI(questions);
  } catch (retryError) {
    console.error(
      "Error querying OpenAI after retry, defaulting to original answers:",
      retryError,
    );

    return questions.map((question) => ({
      questionId: question.questionId,
      polishedAnswer: question.answerText,
    }));
  }
}

export async function createAIAnswers({
  campaignId,
  overwrite = false,
  questions,
}: CreateAIAnswersInput): Promise<Answers[]> {
  const questionsToPolish = questions.filter(
    (question) => question.originalText.trim().length > 0,
  );

  if (questionsToPolish.length === 0) {
    return [];
  }

  const questionsWithExistingAnswers = await Promise.all(
    questionsToPolish.map(async (question) => ({
      question,
      existingAnswer: await readAnswerByCampaignAndQuestion(
        campaignId,
        question.questionId,
      ),
    })),
  );

  const questionsNeedingPolish = questionsWithExistingAnswers.filter(
    ({ existingAnswer }) =>
      overwrite || !existingAnswer?.ai_answer?.trim().length,
  );

  if (questionsNeedingPolish.length === 0) {
    return questionsWithExistingAnswers.flatMap(({ existingAnswer }) =>
      existingAnswer ? [existingAnswer] : [],
    );
  }

  const polishedAnswers = await queryOpenAIWithRetry(
    questionsNeedingPolish.map(({ question }) => ({
      questionId: String(question.questionId),
      questionText: question.questionText,
      answerText: question.originalText,
    })),
  );

  const polishedAnswerByQuestionId = new Map(
    polishedAnswers.map((answer) => [
      Number(answer.questionId),
      answer.polishedAnswer,
    ]),
  );

  const savedAnswers = await Promise.all(
    questionsWithExistingAnswers.map(async ({ question, existingAnswer }) => {
      if (!overwrite && existingAnswer?.ai_answer?.trim().length) {
        return existingAnswer;
      }

      const aiAnswer =
        polishedAnswerByQuestionId.get(question.questionId) ??
        question.originalText;

      if (existingAnswer) {
        const updatedAnswer = await updateAnswer(existingAnswer.answer_id, {
          pre_ai_answer: question.originalText,
          ai_answer: aiAnswer,
        });

        if (!updatedAnswer) {
          throw new Error(
            `Error updating answer for question ${question.questionId}`,
          );
        }

        return updatedAnswer;
      }

      const createdAnswer = await createAnswer({
        campaign_id: campaignId,
        question_id: question.questionId,
        pre_ai_answer: question.originalText,
        ai_answer: aiAnswer,
        final_answer: "",
      });

      if (!createdAnswer) {
        throw new Error(
          `Error creating answer for question ${question.questionId}`,
        );
      }

      return createdAnswer;
    }),
  );

  return savedAnswers;
}
