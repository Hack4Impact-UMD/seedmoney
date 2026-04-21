import { NewQuestion, Question } from "@/src/types";
import { createBrowserClient, createServerClient } from "@/src/lib/supabase-client";

export async function createQuestion(
  question: NewQuestion,
): Promise<Question | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("questions")
    .insert(question)
    .select()
    .single();

  if (error) {
    console.error("Error creating question: ", error.message);
    return null;
  }

  return data as Question;
}

export async function readQuestion(id: number): Promise<Question | null> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("questions")
    .select()
    .eq("question_id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching questions: ", error.message);
    return null;
  }

  return data as Question;
}

export async function updateQuestion(
  id: number,
  question: Partial<NewQuestion>,
): Promise<Question | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("questions")
    .update(question)
    .eq("question_id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating question: ", error.message);
    return null;
  }

  return data as Question;
}

export async function deleteQuestion(id: number): Promise<boolean> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("questions")
    .delete()
    .eq("question_id", id)
    .select("question_id");

  if (error) {
    console.error("Error deleting question: ", error.message);
    return false;
  }

  if (!data || data.length === 0) {
    console.warn("Question not found for deletion:", id);
    return false;
  }

  return true;
}

export async function readActiveQuestions(): Promise<Question[]> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("questions")
    .select()
    .eq("is_active", true)
    .order("question_number", { ascending: true });

  if (error) {
    console.error("Error fetching active questions: ", error.message);
    return [];
  }

  return data as Question[];
}

