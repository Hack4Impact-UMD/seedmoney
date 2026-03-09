"use client";
import Image from "next/image";

type StepStatus =
  | "completed"
  | "current"
  | "review"
  | "unvisited";

type Step = {
  label: string;
  status: StepStatus;
};

const steps: Step[] = [
  { label: "Grantee Agreement", status: "current" },
  { label: "Campaign Information", status: "unvisited" },
  { label: "Garden Information", status: "unvisited" },
  { label: "Garden Story", status: "unvisited" },
  { label: "Contact Information", status: "unvisited" },
  { label: "Review & Submit", status: "unvisited" },
];

export default function ApplicationSidebar() {
  return (
    <div className="flex flex-col gap-4 w-[260px]">

      {steps.map((step, i) => (
        <div key={step.label} className="flex items-start gap-3">

          {/* timeline column */}
          <div className="flex flex-col items-center">

  {/* dot */}
  <StepDot status={step.status} />

  {/* connector line */}
  {i !== steps.length - 1 && (
    <div className="flex flex-col items-center h-[35px]">

      {/* space below dot */}
      <div className="h-[8px]" />

      {/* actual connector */}
      <div className="w-[2px] flex-1 bg-black/10" />

    </div>
  )}

</div>

          {/* step label */}
          <p
            className={`text-[14px] leading-[133%] font-normal
            ${
              step.status === "review"
                ? "text-red-600"
                : "text-black"
            }`}
          >
            {step.label}
          </p>

        </div>
      ))}

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
    return (
      <div className="w-[12px] h-[12px] rounded-full bg-[#56BD60]" />
    );
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