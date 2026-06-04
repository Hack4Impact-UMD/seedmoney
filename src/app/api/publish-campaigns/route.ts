import { publishDueCampaigns } from "@/src/actions/givebutter/campaignsGivebutter";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await publishDueCampaigns();
    return NextResponse.json({ message: "OK", results });
  } catch (error) {
    console.error("Publish cron error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}