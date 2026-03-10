import Footer from "@/src/components/Footer";
import LoginNavbar from "@/src/components/LoginNavbar";
import { ApplicationFormProvider } from "@/src/components/application/ApplicationFormProvider";
import { createServerClient } from "@/src/lib/supabase-client";

export default async function ApplyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <div className="bg-[#F6FAF9]">
      <LoginNavbar session={session} />
      <ApplicationFormProvider>{children}</ApplicationFormProvider>
      <Footer />
    </div>
  );
}
