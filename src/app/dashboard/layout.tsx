// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@/src/lib/supabase-client";
import AuthProvider from "@/src/context/AuthProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/");
  }

  return (
    <AuthProvider initialUser={data.user}>
      {children}
    </AuthProvider>
  );
}