import OpenAI from "openai";

export async function queryOpenAI(): Promise<string> {
  const client = new OpenAI();

  const response = await client.responses.create({
    model: "gpt-5.5",
    input: `You are a copyeditor for Seedmoney, 
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
  });

  console.log(response.output_text);
  return response.output_text;
}
