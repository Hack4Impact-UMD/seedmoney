import type { NewAnswer, Answers } from "@/src/types";
import { createServerClient } from "@/src/lib/supabase-client";

export const supabase = await createServerClient();

export async function createAnswer(data: NewAnswer): Promise<Answers | null> {
  const { data: insertedData, error} = await supabase
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

export async function updateAnswer(id: number, data: Partial<NewAnswer>): Promise<Answers | null> {
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
  const { error } = await supabase
    .from("answers")
    .delete()
    .eq("answer_id", id);

  if (error) {
    console.error("Error deleting answer: ", error.message)
    return false;
  }

  return true;
}