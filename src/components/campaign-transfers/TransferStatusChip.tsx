import { Chip } from "@mui/material";
import type { TransferStatus } from "@/src/types/accountDeletion";

const CHIPS: Partial<
  Record<
    TransferStatus,
    { label: string; variant: "transfer_pending" | "transfer_expired" | "transferred" }
  >
> = {
  pending: { label: "Transfer pending", variant: "transfer_pending" },
  expired: { label: "Expired", variant: "transfer_expired" },
  accepted: { label: "Transferred", variant: "transferred" },
};

export default function TransferStatusChip({ status }: { status: TransferStatus }) {
  const chip = CHIPS[status];

  if (!chip) return null;

  return <Chip variant={chip.variant} label={chip.label} />;
}
