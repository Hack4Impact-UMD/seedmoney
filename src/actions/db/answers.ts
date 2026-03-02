import type { NewAnswer, Answer } from "@/src/types";
import { supabase } from "@/src/lib/supabase-client";


export async function createAnswer(answer: NewAnswer){
  const { error } = await supabase
    .from("answers")
    .insert(answer);
  
  if (error) {
    console.error("Error creating answer:", error.message);
    return;
  }
}

export async function readAnswer(answerId: number): Promise<Answer | null> {
  const { data, error } = await supabase
    .from("answers")
    .select() // select all columns of answer
    .eq("answer_id", answerId) // finding the wanted answer
    .maybeSingle();

    if (error) {
      console.error("Error fetching answer:", error.message);
      return null;
    }

    return data;
}