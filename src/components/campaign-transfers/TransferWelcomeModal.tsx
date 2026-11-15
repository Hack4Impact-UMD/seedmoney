"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Button from "@mui/material/Button";
import ConfirmEditModalShell from "@/src/components/settings-modals/ConfirmEditModalShell";
import useReadAcceptedTransfer from "@/src/hooks/campaign-transfers/useReadAcceptedTransfer";

const TITLE_COLOR = "#123A1E";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Shown once to the new leader after /transfer/accept redirects here with ?transferred=1.
export default function TransferWelcomeModal({ campaignId }: { campaignId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("transferred") === "1";
  const { data: transfer } = useReadAcceptedTransfer(campaignId, isOpen);

  const handleClose = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("transferred");
    const nextQuery = nextSearchParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }, [pathname, router, searchParams]);

  if (!isOpen || !transfer) return null;

  return (
    <ConfirmEditModalShell
      open
      onClose={handleClose}
      title={`You’re now leading “${transfer.campaignName}”`}
      titleColor={TITLE_COLOR}
      actions={
        <Button variant="contained" size="small" onClick={handleClose}>
          Go to campaign
        </Button>
      }
    >
      <div className="text-[14px] leading-[1.5] text-[#333] sm:text-[16px]">
        <p>
          <strong>{transfer.inviterName || "The previous leader"}</strong>{" "}
          transferred this campaign to you on{" "}
          <strong>{formatDate(transfer.acceptedAt)}</strong>. Everything stays
          as it was: the campaign page, its donations so far, and its standing
          in the challenge.
        </p>
        <p className="mt-6">You can now:</p>
        <ul>
          <li>• See donations and analytics</li>
          <li>• Get an email for every new donation</li>
          <li>• Share the campaign link and QR code</li>
        </ul>
        <p className="mt-6">
          Something look wrong? Contact roger@seedmoney.org.
        </p>
      </div>
    </ConfirmEditModalShell>
  );
}
