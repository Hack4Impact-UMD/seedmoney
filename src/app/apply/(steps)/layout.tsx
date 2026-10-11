"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import ApplicationSidebar from "@/src/components/application/ApplicationSidebar";
import ApplicationFooter from "@/src/components/application/ApplicationFooter";
import {
  useAgreementGate,
  useApplicationForm,
} from "@/src/components/application/ApplicationFormProvider";
import ReviewBanner from "@/src/components/application/ReviewBanner";
import {
  APPLICATION_STEPS,
  IncompleteCards,
  formatIncompleteMessage,
  getIncompleteCards,
} from "@/src/components/application/applicationStepState";

const SECTION_BY_HREF: Record<string, keyof IncompleteCards> = {
  "/apply/campaign": "campaign",
  "/apply/garden": "garden",
  "/apply/story": "story",
  "/apply/contact": "contact",
};

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

  const form = useApplicationForm();
  const currentIndex = APPLICATION_STEPS.findIndex(
    (step) => step.href === pathname,
  );
  const [furthestIndex, setFurthestIndex] = useState(currentIndex);

  if (currentIndex > furthestIndex) {
    setFurthestIndex(currentIndex);
  }

  const section = SECTION_BY_HREF[pathname];
  const hasLeftThisStep = currentIndex < furthestIndex;

  if (pathname !== "/apply/terms" && !hasPassedAgreement) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full md:gap-10">
      <div className="hidden md:block relative z-10 shrink-0 self-stretch overflow-visible">
        <Navbar compact />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-4 px-4 md:flex-row md:px-6 lg:px-8">
          <div className="shrink-0 overflow-visible">
            <ApplicationSidebar />
          </div>
          <div className="flex min-w-0 flex-1 justify-start">
            <div className="w-full max-w-[760px] min-w-0">
              {section && hasLeftThisStep && (
                <form.Subscribe
                  selector={(state) =>
                    getIncompleteCards(state.values)[section]
                  }
                >
                  {(titles) =>
                    titles.length > 0 && (
                      <div className="mx-auto mt-10 w-full max-w-[640px]">
                        <ReviewBanner
                          message={formatIncompleteMessage(titles)}
                        />
                      </div>
                    )
                  }
                </form.Subscribe>
              )}
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
