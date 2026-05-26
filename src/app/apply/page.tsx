import { redirect } from "next/navigation";
import { readCurrentCompetition } from "@/src/actions/db/competition-metadata";
export default async function ApplyPage() {
  const competition = await readCurrentCompetition();

  if (competition && !competition.is_application_open) {
    redirect("/");
  }

  redirect("/apply/terms");
}