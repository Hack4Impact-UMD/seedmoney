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
    <div className="flex h-full w-full gap-6 overflow-hidden">
      <div className="relative z-10 h-full shrink-0 overflow-visible">
        <Navbar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 gap-6 overflow-hidden pr-6 md:pr-8 lg:pr-10">
          <div className="h-full shrink-0 overflow-y-auto overflow-x-hidden">
            <ApplicationSidebar />
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
        </div>
        <div className="shrink-0 px-6 pb-5 pt-4 md:px-8 lg:px-10">
          <ApplicationFooter />
        </div>
      </div>
    </div>
  );
}
