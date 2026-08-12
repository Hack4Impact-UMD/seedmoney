import { NextResponse } from "next/server";
import { createServerClient } from "@/src/lib/supabase-client";
import { readCampaignMember } from "@/src/actions/db/campaign-members";
import { createAIAnswers } from "@/src/actions/db/ai-polish";

export const maxDuration = 60;

type AiPolishRequestBody = {
  campaignId: number;
  overwrite?: boolean;
  questions: {
    questionId: number;
    questionText: string;
    originalText: string;
  }[];
};

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<AiPolishRequestBody>;

    if (
      typeof body.campaignId !== "number" ||
      !Array.isArray(body.questions)
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const membership = await readCampaignMember(body.campaignId, user.id);

    if (!membership || membership.role !== "campaign_leader") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const validQuestions = body.questions.filter(
      (question) =>
        typeof question.questionId === "number" &&
        typeof question.questionText === "string" &&
        typeof question.originalText === "string",
    );

    if (validQuestions.length === 0) {
      return NextResponse.json({ error: "No valid questions provided" }, { status: 400 });
    }

    await createAIAnswers({
      campaignId: body.campaignId,
      overwrite: body.overwrite,
      questions: validQuestions,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error handling AI polish request:", error);
    return NextResponse.json(
      { error: "Failed to process AI polish request" },
      { status: 500 },
    );
  }
}
