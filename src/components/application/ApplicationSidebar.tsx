"use client";

import Image from "next/image";
import Link from "next/link";
import { useApplicationForm } from "./ApplicationFormProvider";
import { StepStatus } from "@/src/types/form";

const stepHrefMap: Record<string, string> = {
  "Grantee Agreement": "/apply/terms",
  "Campaign Information": "/apply/campaign",
  "Garden Information": "/apply/garden",
  "Garden Story": "/apply/story",
  "Contact Information": "/apply/contact",
  "Review & Submit": "/apply/review",
};

export default function ApplicationSidebar() {
  const form = useApplicationForm();

  return (
    <div className="flex flex-col gap-4 w-[260px] mt-20">
      {/* 1. Wrap the list in form.Subscribe to listen for changes */}
      <form.Subscribe selector={(state) => state.values.steps}>
        {(steps) => (
          <>
            {steps?.map((step, i) => {
              const agreementCompleted =
                steps[0]?.status === "completed";
              const canNavigate =
                step.label === "Grantee Agreement" || agreementCompleted;
              const content = (
                <div
                  className={`flex items-start gap-3 ${
                    canNavigate ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <StepDot status={step.status} />

                    {i !== steps.length - 1 && (
                      <div className="flex flex-col items-center h-[35px]">
                        <div className="h-[8px]" />
                        <div
                          className={`w-[2px] flex-1 ${
                            steps[i + 1].status === "unvisited"
                              ? "bg-black/10"
                              : "bg-[#56BD60]"
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  <p
                    className={`text-md leading-[133%] font-normal -translate-y-1
                    text-black
                    ${step.status === "review" ? "text-red-600" : ""}
                    ${canNavigate ? "hover:opacity-80" : "opacity-60"}`}
                  >
                    {step.label}
                  </p>
                </div>
              );

              if (!canNavigate) {
                return <div key={step.label}>{content}</div>;
              }

              return (
                <Link key={step.label} href={stepHrefMap[step.label]}>
                  {content}
                </Link>
              );
            })}
          </>
        )}
      </form.Subscribe>

      {/* autosave indicator */}
      <div className="flex items-center gap-2 text-[#666] text-[14px] mt-3">
        <Image
          src="/icons/autosave.svg"
          alt="Autosave icon"
          width={20}
          height={17}
        />
        Auto saved at 3:42 PM
      </div>
    </div>
  );
}
// dot component handles the different visual states

function StepDot({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return <div className="w-[12px] h-[12px] rounded-full bg-[#56BD60]" />;
  }

  if (status === "current") {
    return (
      <div className="w-[12px] h-[12px] rounded-full border-2 border-[#56BD60]" />
    );
  }

  if (status === "review") {
    return (
      <div className="w-[12px] h-[12px] rounded-full border-2 border-[#D32F2F]" />
    );
  }

  return (
    <div className="w-[12px] h-[12px] rounded-full border-2 border-black/10" />
  );
}
