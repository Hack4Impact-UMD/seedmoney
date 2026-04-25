"use server";

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

function buildFallbackAnswers(
  questions: PolishQuestionInput[],
): PolishQuestionOutput[] {
  return questions.map((question) => ({
    questionId: question.questionId,
    polishedAnswer: question.answerText,
  }));
}

function getOpenAIErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function isRetryableOpenAIError(error: unknown) {
  // Auth/permission failures will never recover on retry.
  if (
    error instanceof OpenAI.AuthenticationError ||
    error instanceof OpenAI.PermissionDeniedError
  ) {
    return false;
  }

  // Quota exhaustion is surfaced as RateLimitError with code "insufficient_quota".
  if (
    error instanceof OpenAI.RateLimitError &&
    (error as { code?: string }).code === "insufficient_quota"
  ) {
    return false;
  }

  return (
    error instanceof OpenAI.APIConnectionError ||
    error instanceof OpenAI.InternalServerError ||
    error instanceof OpenAI.RateLimitError
  );
}

async function queryOpenAI(
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
    model: "gpt-5-mini",
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

function hasReusableAiAnswer(
  existingAnswer: Answers | null,
  originalText: string,
) {
  const aiAnswer = existingAnswer?.ai_answer?.trim();

  if (!aiAnswer) {
    return false;
  }

  const originalSource =
    existingAnswer?.pre_ai_answer?.trim() || originalText.trim();

  return aiAnswer !== originalSource;
}

async function queryOpenAIWithRetry(
  questions: PolishQuestionInput[],
): Promise<PolishQuestionOutput[]> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.warn(
      "OPENAI_API_KEY is not configured. Skipping AI polishing and defaulting to original answers.",
    );
    return buildFallbackAnswers(questions);
  }

  try {
    return await queryOpenAI(questions);
  } catch (error) {
    if (!isRetryableOpenAIError(error)) {
      console.warn(
        "OpenAI polishing is unavailable, defaulting to original answers:",
        getOpenAIErrorMessage(error),
      );
      return buildFallbackAnswers(questions);
    }

    console.error("Error querying OpenAI, retrying once:", error);
  }

  try {
    return await queryOpenAI(questions);
  } catch (retryError) {
    console.warn(
      "OpenAI polishing failed after retry, defaulting to original answers:",
      getOpenAIErrorMessage(retryError),
    );

    return buildFallbackAnswers(questions);
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
    ({ question, existingAnswer }) =>
      overwrite || !hasReusableAiAnswer(existingAnswer, question.originalText),
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
      if (
        !overwrite &&
        existingAnswer &&
        hasReusableAiAnswer(existingAnswer, question.originalText)
      ) {
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
