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
      <div className="flex items-center gap-4 border-b border-gray-300 pb-4 md:gap-6">
        <div className="shrink-0 text-[#1f2320]">{icon}</div>
        <div>
          <h4 className="text-2xl font-semibold text-black">{title}</h4>
          <p className="mt-2 text-[#1f2320]">{description}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="font-semibold text-black">Includes</p>
        <ul className="mt-1 list-disc pl-8 text-[#1f2320]">
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
