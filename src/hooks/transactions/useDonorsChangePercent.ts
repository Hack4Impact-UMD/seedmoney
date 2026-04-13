import { useMemo } from "react";
import useReadCampaignTransactions from "./useReadCampaignTransactions";
import { calculateDonorsChangePercent } from "@/src/lib/utils/weekOverWeekChange";

export default function useDonorsChangePercent(campaignId: number) {
  const { data, isLoading, isError } = useReadCampaignTransactions(campaignId);
  const percent = useMemo(
    () => calculateDonorsChangePercent(data ?? []),
    [data],
  );
  return { percent, isLoading, isError };
}
