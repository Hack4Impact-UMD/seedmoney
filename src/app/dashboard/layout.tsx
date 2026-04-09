import { redirect } from "next/navigation";
import { createServerClient } from "@/src/lib/supabase-client";
import AuthProvider from "@/src/context/AuthProvider";
import QueryProvider from "@/src/providers/QueryProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  // if (!data.user) {
  //   redirect("/");
  // }

  const mockUser = { id: 'dev-user-id', email: 'dev@example.com', is_admin: true, first_name: 'Dev', last_name: 'User', phone_number: '123-456-7890', middle_name: 'D', created_at: '2023-01-01T00:00:00.000Z', updated_at: '2023-01-01T00:00:00.000Z', app_metadata: { provider: 'email' }, user_metadata: {}, user_id: 'dev-user-id', app_id: 'dev-app-id', aud: 'dev-aud', email_confirmed_at: '2023-01-01T00:00:00.000Z', phone_confirmed_at: '2023-01-01T00:00:00.000Z' };

  return (
    <QueryProvider>
      <AuthProvider initialUser={data.user || mockUser}>{children}</AuthProvider>
    </QueryProvider>
  );
}
