import type { NewAnswer, Answer } from "@/src/types";
import { supabase } from "@/src/lib/supabase-client";


export async function createAnswer(data: NewAnswer){
  const { error } = await supabase
    .from("answers")
    .insert(data);
  
  if (error) {
    console.error("Error creating answer:", error.message);
    return;
  }
}

export async function readAnswer(id: number): Promise<Answer | null> {
  const { data, error } = await supabase
    .from("answers")
    .select() // select all columns of answer
    .eq("answer_id", id) // finding the wanted answer
    .maybeSingle();

    if (error) {
      console.error("Error fetching answer:", error.message);
      return null;
    }

    return data;
}

export async function updateAnswer(id: number, data: Partial<Answer>) {
  const { error } = await supabase
    .from("answers")
    .update(data)
    .eq("answer_id", id);

    if (error) {
      console.error("Error updating answer:", error.message);
      return;
    }
}