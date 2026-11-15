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

type TransferStatusChipProps = {
  status: TransferStatus;
  onClick?: () => void;
};

export default function TransferStatusChip({ status, onClick }: TransferStatusChipProps) {
  const chip = CHIPS[status];

  if (!chip) return null;

  return <Chip variant={chip.variant} label={chip.label} onClick={onClick} />;
}
