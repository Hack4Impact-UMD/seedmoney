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
        <div className="flex items-center gap-3">
          <TransferStatusChip
            status={transfer.status}
            onClick={() => setManaging(true)}
          />
          <button
            type="button"
            onClick={() => setManaging(true)}
            className="text-[14px] font-bold text-[#2D7A45] underline"
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
