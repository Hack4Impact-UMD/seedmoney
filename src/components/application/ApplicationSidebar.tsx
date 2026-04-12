"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useAgreementGate,
  useApplicationForm,
  useLastSaved,
} from "./ApplicationFormProvider";
import { StepStatus } from "@/src/types/form";
import {
  APPLICATION_STEPS,
  getApplicationCompletionState,
  getDerivedApplicationSteps,
} from "./applicationStepState";

export default function ApplicationSidebar() {
  const form = useApplicationForm();
  const { hasPassedAgreement } = useAgreementGate();
  const { lastSaved } = useLastSaved();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 w-[260px] mt-20">
      <form.Subscribe
        selector={(state) => ({
          campaignTitle: state.values.campaignTitle,
          beneficiaryCount: state.values.beneficiaryCount,
          gardenSize: state.values.gardenSize,
          gardenStatus: state.values.gardenStatus,
          fundraisingGoal: state.values.fundraisingGoal,
          gardenCity: state.values.gardenCity,
          gardenState: state.values.gardenState,
          gardenCountry: state.values.gardenCountry,
          gardenCategory: state.values.gardenCategory,
          gardenBeneficiaries: state.values.gardenBeneficiaries,
          storyLocationAndAudience: state.values.storyLocationAndAudience,
          storyChallenge: state.values.storyChallenge,
          storySeasonActivity: state.values.storySeasonActivity,
          storyCampaignImpact: state.values.storyCampaignImpact,
          mainPhoto: state.values.mainPhoto,
          organizationName: state.values.organizationName,
          organizationIdentifier: state.values.organizationIdentifier,
          mailingStreet1: state.values.mailingStreet1,
          mailingStreet2: state.values.mailingStreet2,
          mailingCity: state.values.mailingCity,
          mailingState: state.values.mailingState,
          mailingZip: state.values.mailingZip,
          mailingCountry: state.values.mailingCountry,
          contactFirstName: state.values.contactFirstName,
          contactLastName: state.values.contactLastName,
          contactEmail: state.values.contactEmail,
          contactRole: state.values.contactRole,
        })}
      >
        {(values) => {
          const steps = getDerivedApplicationSteps(
            pathname,
            values,
            hasPassedAgreement,
          );
          const { agreementComplete } = getApplicationCompletionState(
            values,
            hasPassedAgreement,
          );

          return (
            <>
              {steps?.map((step, i) => {
                const canNavigate =
                  step.label === "Grantee Agreement" || agreementComplete;
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
                  <Link key={step.label} href={APPLICATION_STEPS[i].href}>
                    {content}
                  </Link>
                );
              })}
            </>
          );
        }}
      </form.Subscribe>

      {/* autosave indicator */}
      <div className="flex items-center gap-2 text-[#666] text-[14px] mt-3">
        <Image
          src="/icons/autosave.svg"
          alt="Autosave icon"
          width={20}
          height={17}
        />
        {lastSaved ? `Auto saved at ${lastSaved}` : "Not saved yet"}
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
