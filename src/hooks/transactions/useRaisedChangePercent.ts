import { useMemo } from "react";
import useReadCampaignTransactions from "./useReadCampaignTransactions";
import { calculateRaisedChangePercent } from "@/src/lib/utils/weekOverWeekChange";

export default function useRaisedChangePercent(campaignId: number) {
  const { data, isLoading, isError } = useReadCampaignTransactions(campaignId);
  const percent = useMemo(
    () => calculateRaisedChangePercent(data ?? []),
    [data],
  );
  return { percent, isLoading, isError };
}
