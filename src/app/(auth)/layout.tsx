import { redirect } from "next/navigation";
import { createServerClient } from "@/src/lib/supabase-client";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) redirect("/dashboard");

  return children;
}