import { useState } from "react";
import Button from "@mui/material/Button";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import type { UseMutationResult } from "@tanstack/react-query";
import ExportDialog, {
  type ExportStep,
} from "@/src/components/export/ExportDialog";

type ExportCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  includes: string[];
  buttonLabel: string;
  confirmTitle: string;
  confirmMessage: string;
  successMessage: string;
  exportMutation: UseMutationResult<unknown, Error, void>;
};

export default function ExportCard({
  icon,
  title,
  description,
  includes,
  buttonLabel,
  confirmTitle,
  confirmMessage,
  successMessage,
  exportMutation,
}: ExportCardProps) {
  const [step, setStep] = useState<ExportStep>("closed");

  const handleConfirm = () => {
    setStep("preparing");
    exportMutation.mutate(undefined, {
      // Closing the dialog while preparing still lets the download finish,
      // but doesn't reopen it on success. Errors are always shown.
      onSuccess: () =>
        setStep((current) => (current === "closed" ? current : "ready")),
      onError: () => setStep("error"),
    });
  };

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
      {/* Mobile: icon + title on one row, description full width below.
          Desktop: large icon to the left of the title and description. */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 md:gap-x-6 md:border-b md:border-gray-300 md:pb-4">
        <div className="flex text-[40px] text-[#1f2320] md:row-span-2 md:text-[64px]">
          {icon}
        </div>
        <h4 className="text-2xl font-semibold text-black">{title}</h4>
        <p className="col-span-2 mt-3 text-[#1f2320] md:col-span-1 md:col-start-2 md:mt-2">
          {description}
        </p>
      </div>

      <div className="mt-4">
        <p className="font-semibold text-black">Includes</p>
        <ul className="mt-1 list-disc pl-5 text-[#1f2320] md:pl-8">
          {includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <Button
        variant="contained"
        onClick={() => setStep("confirm")}
        disabled={exportMutation.isPending}
        startIcon={<FileDownloadOutlinedIcon />}
        className="!w-full md:!w-auto"
        sx={{
          mt: 3,
          bgcolor: "#2D7A45",
          fontWeight: 700,
          "&:hover": { bgcolor: "#123A1E" },
        }}
      >
        {buttonLabel}
      </Button>

      <ExportDialog
        step={step}
        confirmTitle={confirmTitle}
        confirmMessage={confirmMessage}
        successMessage={successMessage}
        onConfirm={handleConfirm}
        onClose={() => setStep("closed")}
      />
    </section>
  );
}
