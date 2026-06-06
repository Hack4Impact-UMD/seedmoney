import DashboardFooter from "@/src/components/DashboardFooter";
import LoginNavbar from "@/src/components/LoginNavbar";

export default function StaticPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LoginNavbar />
      <main className="min-h-screen bg-[#F6FAF9]">{children}</main>
      <div className="bg-[#F6FAF9] px-4 md:px-8">
        <DashboardFooter />
      </div>
    </>
  );
}
