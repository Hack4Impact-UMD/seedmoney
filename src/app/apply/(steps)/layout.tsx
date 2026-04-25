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
    <div className="flex min-h-screen w-full gap-10">
      <div className="relative z-10 shrink-0 self-stretch overflow-visible">
        <Navbar compact />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 flex-1 gap-4 px-4 md:px-6 lg:px-8">
          <div className="shrink-0 overflow-visible">
            <ApplicationSidebar />
          </div>
          <div className="flex min-w-0 flex-1 justify-start">
            <div className="w-full max-w-[760px] min-w-0">
              {children}
            </div>
          </div>
        </div>
        <div className="mt-auto shrink-0 px-4 pb-4 pt-3 md:px-6 lg:px-8">
          <ApplicationFooter />
        </div>
      </div>
    </div>
  );
}
