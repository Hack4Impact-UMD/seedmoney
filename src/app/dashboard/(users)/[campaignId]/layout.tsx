import { redirect } from "next/navigation";
import { createServerClient } from "@/src/lib/supabase-client";

import DashboardShell from "./DashboardShell";

export default async function Layout({ children }: { children: React.ReactNode }) {

  const supabase = await createServerClient();

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/");

  return <DashboardShell>{children}</DashboardShell>;
}