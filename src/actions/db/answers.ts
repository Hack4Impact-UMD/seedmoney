import type { NewAnswer, Answers } from "@/src/types";
import {
  createBrowserClient,
  createServerClient,
} from "@/src/lib/supabase-client";
import type { Question } from "@/src/types/db/questions";

export type AnswerWithQuestion = Answers & { questions: Question | null };

function getLatestAnswersByQuestion<T extends Pick<Answers, "answer_id" | "question_id">>(
  answers: readonly T[],
): T[] {
  const latestByQuestion = new Map<number, T>();

  for (const answer of answers) {
    const latest = latestByQuestion.get(answer.question_id);

    if (!latest || answer.answer_id > latest.answer_id) {
      latestByQuestion.set(answer.question_id, answer);
    }
  }

  return [...latestByQuestion.values()];
}

async function createReadClient() {
  if (typeof window === "undefined") {
    return await createServerClient();
  }

  return createBrowserClient();
}

async function createWriteClient() {
  if (typeof window === "undefined") {
    return await createServerClient();
  }

  return createBrowserClient();
}

export async function createAnswer(data: NewAnswer): Promise<Answers | null> {
  const supabase = await createWriteClient();

  const { data: insertedData, error } = await supabase
    .from("answers")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating answer:", error.message);
    return null;
  }
  return insertedData as Answers; // ensures returning data from the query
}

export async function readAnswer(id: number): Promise<Answers | null> {
  const supabase = await createReadClient();

  const { data, error } = await supabase
    .from("answers")
    .select() // select all columns of answer
    .eq("answer_id", id) // finding the wanted answer
    .maybeSingle();

  if (error) {
    console.error("Error fetching answer: ", error.message);
    return null;
  }

  return data as Answers;
}

export async function updateAnswer(
  id: number,
  data: Partial<NewAnswer>,
): Promise<Answers | null> {
  const supabase = await createWriteClient();

  const { data: updatedData, error } = await supabase
    .from("answers")
    .update(data)
    .eq("answer_id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating answer: ", error.message);
    return null;
  }

  return updatedData as Answers;
}

export async function deleteAnswer(id: number): Promise<boolean> {
  const supabase = await createWriteClient();

  const { error } = await supabase.from("answers").delete().eq("answer_id", id);

  if (error) {
    console.error("Error deleting answer: ", error.message);
    return false;
  }

  return true;
}

export async function readAnswerByCampaignAndQuestion(
  campaignId: number,
  questionId: number,
): Promise<Answers | null> {
  const supabase = await createReadClient();

  const { data, error } = await supabase
    .from("answers")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("question_id", questionId)
    .order("answer_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error reading answer by campaign/question:", error.message);
    return null;
  }

  return data as Answers;
}

export async function createFinalAnswer({
  campaignId,
  questionId,
  finalAnswer,
}: {
  campaignId: number;
  questionId: number;
  finalAnswer: string;
}): Promise<Answers | null> {
  const existingAnswer = await readAnswerByCampaignAndQuestion(
    campaignId,
    questionId,
  );

  if (existingAnswer) {
    return updateAnswer(existingAnswer.answer_id, {
      final_answer: finalAnswer,
    });
  }

  return createAnswer({
    campaign_id: campaignId,
    question_id: questionId,
    pre_ai_answer: "",
    ai_answer: "",
    final_answer: finalAnswer,
  });
}

export async function createOriginalAnswer({
  campaignId,
  questionId,
  originalAnswer,
}: {
  campaignId: number;
  questionId: number;
  originalAnswer: string;
}): Promise<Answers | null> {
  const existingAnswer = await readAnswerByCampaignAndQuestion(
    campaignId,
    questionId,
  );

  if (existingAnswer) {
    return updateAnswer(existingAnswer.answer_id, {
      pre_ai_answer: originalAnswer,
      final_answer: originalAnswer,
    });
  }

  return createAnswer({
    campaign_id: campaignId,
    question_id: questionId,
    pre_ai_answer: originalAnswer,
    ai_answer: "",
    final_answer: originalAnswer,
  });
}

export async function readAnswersByCampaign(
  campaignId: number,
): Promise<AnswerWithQuestion[]> {
  const supabase = await createReadClient();

  const { data, error } = await supabase
    .from("answers")
    .select("*, questions(*)")
    .eq("campaign_id", campaignId);

  if (error) {
    console.error("Error reading answers by campaign:", error.message);
    return [];
  }

  const sorted = getLatestAnswersByQuestion(data ?? []).sort(
    (a, b) =>
      (a.questions?.question_number ?? 0) - (b.questions?.question_number ?? 0),
  );

  return sorted as AnswerWithQuestion[];
}

export async function readAnswersByCampaignId(
  campaignId: number,
): Promise<AnswerWithQuestion[]> {
  const supabase = await createReadClient();

  // 1. Fetch answers for this explicit campaign
  const { data: answersData, error: answersError } = await supabase
    .from("answers")
    .select("*")
    .eq("campaign_id", campaignId);

  if (answersError) {
    console.error(
      "Error fetching garden story answers: ",
      answersError.message,
    );
    return [];
  }

  if (!answersData || answersData.length === 0) {
    return [];
  }

  const latestAnswers = getLatestAnswersByQuestion(answersData);

  // 2. Gather distinct question IDs to fetch
  const questionIds = [...new Set(latestAnswers.map((a) => a.question_id))];

  if (questionIds.length === 0) {
    return latestAnswers as unknown as AnswerWithQuestion[];
  }

  // 3. Fetch matched questions using the readQuestion logic
  // Applying the logic from readQuestion pluralized for performance
  const { data: questionsData, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .in("question_id", questionIds);

  if (questionsError) {
    console.error("Error fetching questions: ", questionsError.message);
    return latestAnswers as unknown as AnswerWithQuestion[];
  }

  // 4. Map together consistently
  const results: AnswerWithQuestion[] = latestAnswers.map((answer) => {
    const matchedQuestion =
      questionsData?.find((q) => q.question_id === answer.question_id) || null;

    return {
      ...answer,
      questions: matchedQuestion,
    } as AnswerWithQuestion;
  });

  return results.sort(
    (a, b) =>
      (a.questions?.question_number ?? 0) - (b.questions?.question_number ?? 0),
  );
}
