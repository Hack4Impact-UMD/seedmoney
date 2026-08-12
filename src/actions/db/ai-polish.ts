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

function getOpenAIErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function logOpenAIError(context: string, error: unknown) {
  // Log everything we can about the error shape so it shows up in Vercel logs
  console.error(`[ai-polish] ${context}`);
  console.error(`[ai-polish] error name:`, (error as Error)?.name);
  console.error(`[ai-polish] error message:`, getOpenAIErrorMessage(error));

  if (error instanceof OpenAI.APIError) {
    console.error(`[ai-polish] status:`, error.status);
    console.error(`[ai-polish] code:`, error.code);
    console.error(`[ai-polish] type:`, error.type);
    console.error(`[ai-polish] request_id:`, (error as { request_id?: string }).request_id);
  }

  // Full raw dump as a last resort
  try {
    console.error(`[ai-polish] raw error:`, JSON.stringify(error, Object.getOwnPropertyNames(error as object)));
  } catch {
    console.error(`[ai-polish] raw error (unstringifiable):`, error);
  }
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

  console.log(`[ai-polish] starting OpenAI call for ${questions.length} question(s)`);
  const startTime = Date.now();

  const client = new OpenAI({
    maxRetries: 0,
    timeout: 40000,
  });

  let response;
  try {
    response = await client.responses.create({
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
  } catch (error) {
    console.error(`[ai-polish] OpenAI call threw after ${Date.now() - startTime}ms`);
    logOpenAIError("client.responses.create failed", error);
    throw error;
  }

  console.log(`[ai-polish] OpenAI call succeeded in ${Date.now() - startTime}ms`);
  console.log(`[ai-polish] raw output_text length:`, response.output_text?.length);

  let parsed: { answers: PolishQuestionOutput[] };
  try {
    parsed = JSON.parse(response.output_text) as {
      answers: PolishQuestionOutput[];
    };
  } catch (error) {
    console.error(`[ai-polish] failed to JSON.parse output_text`);
    console.error(`[ai-polish] output_text was:`, response.output_text);
    throw error;
  }

  console.log(`[ai-polish] parsed ${parsed.answers?.length ?? 0} answer(s)`);
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
    console.error(`[ai-polish] OPENAI_API_KEY is missing or empty in this environment`);
    throw new Error(
      "OPENAI_API_KEY is not configured. AI polishing cannot run.",
    );
  }

  try {
    return await queryOpenAI(questions);
  } catch (error) {
    const retryable = isRetryableOpenAIError(error);
    console.error(`[ai-polish] queryOpenAI failed. retryable=${retryable}`);
    logOpenAIError("queryOpenAIWithRetry catch block", error);

    if (!retryable) {
      throw new Error(
        `OpenAI polishing is unavailable: ${getOpenAIErrorMessage(error)}`,
      );
    }

    throw new Error(
      `OpenAI polishing timed out or failed: ${getOpenAIErrorMessage(error)}`,
    );
  }
}

export async function createAIAnswers({
  campaignId,
  overwrite = false,
  questions,
}: CreateAIAnswersInput): Promise<Answers[]> {
  console.log(`[ai-polish] createAIAnswers called. campaignId=${campaignId}, overwrite=${overwrite}, questionCount=${questions.length}`);

  const questionsToPolish = questions.filter(
    (question) => question.originalText.trim().length > 0,
  );

  if (questionsToPolish.length === 0) {
    console.log(`[ai-polish] no questions with non-empty originalText, returning early`);
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

  console.log(`[ai-polish] ${questionsNeedingPolish.length} of ${questionsWithExistingAnswers.length} question(s) need polishing`);

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

  for (const { question } of questionsNeedingPolish) {
    const polishedAnswer = polishedAnswerByQuestionId.get(question.questionId);

    if (typeof polishedAnswer !== "string" || polishedAnswer.trim().length === 0) {
      console.error(`[ai-polish] missing polished answer for questionId=${question.questionId}`);
      throw new Error(
        `OpenAI response was missing a polished answer for question ${question.questionId}`,
      );
    }
  }

  const savedAnswers = await Promise.all(
    questionsWithExistingAnswers.map(async ({ question, existingAnswer }) => {
      if (
        !overwrite &&
        existingAnswer &&
        hasReusableAiAnswer(existingAnswer, question.originalText)
      ) {
        return existingAnswer;
      }

      const aiAnswer = polishedAnswerByQuestionId.get(question.questionId);

      if (typeof aiAnswer !== "string") {
        throw new Error(
          `OpenAI response was missing a polished answer for question ${question.questionId}`,
        );
      }

      if (existingAnswer) {
        const updatedAnswer = await updateAnswer(existingAnswer.answer_id, {
          pre_ai_answer: question.originalText,
          ai_answer: aiAnswer,
          final_answer: aiAnswer,
        });

        if (!updatedAnswer) {
          console.error(`[ai-polish] updateAnswer returned null for answer_id=${existingAnswer.answer_id}`);
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
        final_answer: aiAnswer,
      });

      if (!createdAnswer) {
        console.error(`[ai-polish] createAnswer returned null for question_id=${question.questionId}`);
        throw new Error(
          `Error creating answer for question ${question.questionId}`,
        );
      }

      return createdAnswer;
    }),
  );

  console.log(`[ai-polish] createAIAnswers completed successfully, returning ${savedAnswers.length} answer(s)`);
  return savedAnswers;
}