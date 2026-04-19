"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
    <div className="flex h-full w-full overflow-hidden px-6 md:px-12 lg:px-20">
      <div className="ml-20 h-full shrink-0 overflow-y-auto overflow-x-hidden">
        <ApplicationSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        <div className="mx-15 shrink-0 pb-5 pt-4">
          <ApplicationFooter />
        </div>
      </div>
    </div>
  );
}
