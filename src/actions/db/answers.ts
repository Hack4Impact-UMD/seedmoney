import type { NewAnswer, Answer } from "@/src/types";
import { supabase } from "@/src/lib/supabase-client";


export async function createAnswer(answer: NewAnswer){
  const { error } = await supabase.from("answers").insert(answer);
  
  if (error) {
    console.error("Error creating answer:", error.message);
    return;
  }
}