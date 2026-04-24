"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import ApplicationSidebar from "@/src/components/application/ApplicationSidebar";
import ApplicationFooter from "@/src/components/application/ApplicationFooter";
import { useAgreementGate } from "@/src/components/application/ApplicationFormProvider";

export default function StepsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPassedAgreement } = useAgreementGate();

  useEffect(() => {
    if (pathname === "/apply/terms" || hasPassedAgreement) {
      return;
    }

    router.replace("/apply/terms");
  }, [hasPassedAgreement, pathname, router]);

  if (pathname !== "/apply/terms" && !hasPassedAgreement) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full gap-16">
      <div className="relative z-10 shrink-0 self-stretch overflow-visible">
        <Navbar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 flex-1 gap-6 pr-6 md:pr-8 lg:pr-10">
          <div className="shrink-0 overflow-visible">
            <ApplicationSidebar />
          </div>
          <div className="min-w-0 flex-1">
            {children}
          </div>
        </div>
        <div className="mt-auto shrink-0 px-6 pb-5 pt-4 md:px-8 lg:px-10">
          <ApplicationFooter />
        </div>
      </div>
    </div>
  );
}
