"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import ApplicationSidebar from "@/src/components/application/ApplicationSidebar";
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
    <div className="flex w-full px-6 md:px-12 lg:px-20">
      <div className="sticky top-0 left-0 h-screen overflow-y-auto overflow-x-hidden ml-20">
        <ApplicationSidebar />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
