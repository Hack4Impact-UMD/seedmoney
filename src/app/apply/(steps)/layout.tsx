import ApplicationSidebar from "@/src/components/application/ApplicationSidebar";

export default function StepsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full px-6 md:px-12 lg:px-20">
      <div className="sticky top-0 left-0 h-screen overflow-y-auto overflow-x-hidden ml-20">
        <ApplicationSidebar />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
