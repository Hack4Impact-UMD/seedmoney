import { useMemo } from "react";
import useReadCampaignTransactions from "./useReadCampaignTransactions";
import { calculateRaisedChangePercent } from "@/src/lib/utils/weekOverWeekChange";

export default function useRaisedChangePercent(
  campaignId: number,
  competitionStartDate: string | undefined,
  options?: { enabled?: boolean },
) {
  const { data, isLoading, isError } = useReadCampaignTransactions(
    campaignId,
    options,
  );
  const percent = useMemo(() => {
    if (!competitionStartDate) return null;
    return calculateRaisedChangePercent(data ?? [], competitionStartDate);
  }, [data, competitionStartDate]);
  return { percent, isLoading, isError };
}
