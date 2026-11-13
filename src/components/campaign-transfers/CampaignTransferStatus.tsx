"use client";

import { useState } from "react";
import BaseAlert from "@/src/components/bases/BaseAlert";
import ManageTransferModal, {
  type TransferToast,
} from "@/src/components/campaign-transfers/ManageTransferModal";
import TransferStatusChip from "@/src/components/campaign-transfers/TransferStatusChip";
import useReadActiveCampaignTransfer from "@/src/hooks/campaign-transfers/useReadActiveCampaignTransfer";

type CampaignTransferStatusProps = {
  campaignId: number;
  campaignName: string;
};

// Dashboard header chip and "Manage transfer" link for a pending or expired transfer.
export default function CampaignTransferStatus({
  campaignId,
  campaignName,
}: CampaignTransferStatusProps) {
  const { data: transfer } = useReadActiveCampaignTransfer(campaignId);
  const [managing, setManaging] = useState(false);
  const [toast, setToast] = useState<TransferToast | null>(null);

  return (
    <>
      {transfer && (
        <div className="flex max-w-full flex-wrap items-center gap-x-3 gap-y-2">
          <TransferStatusChip
            status={transfer.status}
            onClick={() => setManaging(true)}
          />
          <button
            type="button"
            onClick={() => setManaging(true)}
            className="shrink-0 text-[14px] font-bold uppercase text-[#666] md:normal-case md:text-[#2D7A45] md:underline"
          >
            Manage transfer
          </button>
        </div>
      )}

      {transfer && managing && (
        <ManageTransferModal
          transfer={transfer}
          campaignName={campaignName}
          onClose={() => setManaging(false)}
          onDone={setToast}
        />
      )}

      <BaseAlert
        open={!!toast}
        onClose={() => setToast(null)}
        title={toast?.title}
        copySuccess
      >
        {toast?.message}
      </BaseAlert>
    </>
  );
}
