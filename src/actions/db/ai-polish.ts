import OpenAI from "openai";
import {
  createAnswer,
  readAnswerByCampaignAndQuestion,
  updateAnswer,
} from "@/src/actions/db/answers";
import { Answers } from "@/src/types/db/answers";

export async function queryOpenAI(text: string): Promise<string> {
  const client = new OpenAI();

  const response = await client.responses.create({
    model: "gpt-5.4",
    instructions: `You are a copyeditor for Seedmoney, 
    a non-profit that fundraises for community gardens. 
    Your job is to revise given campaign description 
    entries proposed by prospective garden applicants 
    in the grant-management portal. Correct objective 
    errors (spelling, grammar, punctuation). 
    Maintain the original voice and flow of the author. 
    You may rephrase/reword some text to optimize for clarity. 
    Double check your work once completed to ensure you did not 
    misrepresent the original text and maintained the original 
    style.`,
    input: text,
  });

  return response.output_text;
}

export async function createAIAnswer({
  campaignId,
  questionId,
  originalText,
}: {
  campaignId: number;
  questionId: number;
  originalText: string;
}): Promise<Answers | null> {
  const aiAnswer = await queryOpenAI(originalText);

  const existingAnswer = await readAnswerByCampaignAndQuestion(
    campaignId,
    questionId,
  );

  if (existingAnswer) {
    return updateAnswer(existingAnswer.answer_id, {
      pre_ai_answer: originalText,
      ai_answer: aiAnswer,
    });
  }

  return createAnswer({
    campaign_id: campaignId,
    question_id: questionId,
    pre_ai_answer: originalText,
    ai_answer: aiAnswer,
    final_answer: "",
  });
}
