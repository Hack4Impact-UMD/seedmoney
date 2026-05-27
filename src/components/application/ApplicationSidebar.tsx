"use client";

import { ArrowBack } from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useAgreementGate,
  useApplicationForm,
  useDraftCampaignId,
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
  const { draftCampaignId } = useDraftCampaignId();
  const { lastSaved } = useLastSaved();
  const pathname = usePathname();
  const router = useRouter();

  const handleExit = () => {
    router.push(
      draftCampaignId ? `/dashboard/${draftCampaignId}` : "/dashboard",
    );
  };

  return (
    <div className="mt-4 flex w-full flex-col gap-4 md:mt-12 md:w-[220px] md:gap-3">
      {/* Header */}
      <div className="mb-2 flex w-full items-end justify-between md:mb-6">
        <h1 className="text-3xl font-semibold text-[#123A1E]">Application</h1>
        <p className="text-[11px] text-red-500 md:hidden">
          * Indicates required question
        </p>
      </div>

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
            <div className="flex w-full flex-col">
              {/* Desktop Stepper */}
              <div className="hidden flex-col gap-3 md:flex">
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
                          <div className="flex h-[28px] flex-col items-center">
                            <div className="h-[6px]" />
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
                        className={`-translate-y-0.5 text-sm leading-[1.3] font-normal text-black ${
                          step.status === "review" ? "text-red-600" : ""
                        } ${canNavigate ? "hover:opacity-80" : "opacity-60"}`}
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
              </div>

              {/* Mobile Stepper */}
              <div className="flex w-full justify-between pb-2 md:hidden">
                {steps?.map((step, i) => {
                  const canNavigate =
                    step.label === "Grantee Agreement" || agreementComplete;
                  const content = (
                    <div
                      className={`group relative flex flex-1 flex-col items-center ${
                        canNavigate ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <div className="relative mb-2 flex h-[10px] w-full items-center justify-center">
                        {/* Left Line */}
                        <div
                          className={`h-[2px] flex-1 ${
                            i === 0
                              ? "bg-transparent"
                              : step.status === "unvisited"
                                ? "bg-black/10"
                                : "bg-[#56BD60]"
                          }`}
                        />

                        {/* Dot */}
                        <div className="z-10 mx-1">
                          <StepDot status={step.status} />
                        </div>

                        {/* Right Line */}
                        <div
                          className={`h-[2px] flex-1 ${
                            i === steps.length - 1
                              ? "bg-transparent"
                              : steps[i + 1].status === "unvisited"
                                ? "bg-black/10"
                                : "bg-[#56BD60]"
                          }`}
                        />
                      </div>

                      <p
                        className={`text-center text-[10px] leading-[1.2] text-black ${
                          step.status === "review" ? "text-red-600" : ""
                        } ${canNavigate ? "group-hover:opacity-80" : "opacity-60"}`}
                      >
                        {step.label === "Review & Submit" ? (
                          <>
                            Review
                            <br />& Submit
                          </>
                        ) : step.label === "Grantee Agreement" ? (
                          <>
                            Grantee
                            <br />
                            Agreement
                          </>
                        ) : step.label === "Campaign Information" ? (
                          <>
                            Campaign
                            <br />
                            Info
                          </>
                        ) : step.label === "Garden Information" ? (
                          <>
                            Garden
                            <br />
                            Info
                          </>
                        ) : step.label === "Garden Story" ? (
                          <>
                            Garden
                            <br />
                            Story
                          </>
                        ) : step.label === "Contact Information" ? (
                          <>
                            Contact
                            <br />
                            Info
                          </>
                        ) : (
                          step.label
                        )}
                      </p>
                    </div>
                  );

                  if (!canNavigate) {
                    return (
                      <div key={step.label} className="flex flex-1 flex-col">
                        {content}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={step.label}
                      href={APPLICATION_STEPS[i].href}
                      className="flex flex-1 flex-col"
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        }}
      </form.Subscribe>

      {/* Desktop Actions */}
      <div className="hidden flex-col gap-3 md:flex">
        <div
          className={`mt-2 flex items-center gap-2 text-[13px] ${
            lastSaved ? "font-bold text-[#2D7A45]" : "text-[#666]"
          }`}
        >
          <Image
            src={lastSaved ? "/icons/autosave-saved.svg" : "/icons/autosave.svg"}
            alt="Autosave icon"
            width={20}
            height={17}
          />
          {lastSaved ? `Auto saved at ${lastSaved}` : "Not saved yet"}
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="flex w-fit items-center gap-2 text-[13px] text-[#666] hover:opacity-80"
        >
          <ArrowBack sx={{ fontSize: 16 }} />
          Exit
        </button>
      </div>

      {/* Mobile Actions */}
      <div className="mt-4 flex flex-row items-center justify-between md:hidden">
        <button
          type="button"
          onClick={handleExit}
          className="flex w-fit items-center gap-2 text-[13px] text-[#666] hover:opacity-80"
        >
          <ArrowBack sx={{ fontSize: 16 }} />
          Exit
        </button>
        <div
          className={`flex items-center gap-2 text-[13px] ${
            lastSaved ? "font-bold text-[#2D7A45]" : "text-[#666]"
          }`}
        >
          <Image
            src={lastSaved ? "/icons/autosave-saved.svg" : "/icons/autosave.svg"}
            alt="Autosave icon"
            width={20}
            height={17}
          />
          {lastSaved ? `Auto saved at ${lastSaved}` : "Not saved yet"}
        </div>
      </div>
    </div>
  );
}
// dot component handles the different visual states

function StepDot({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return <div className="h-[10px] w-[10px] rounded-full bg-[#56BD60]" />;
  }

  if (status === "current") {
    return (
      <div className="h-[10px] w-[10px] rounded-full border-2 border-[#56BD60]" />
    );
  }

  if (status === "review") {
    return (
      <div className="h-[10px] w-[10px] rounded-full border-2 border-[#D32F2F]" />
    );
  }

  return (
    <div className="h-[10px] w-[10px] rounded-full border-2 border-black/10" />
  );
}
