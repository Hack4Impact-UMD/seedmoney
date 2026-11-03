import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  holdCampaign,
  readCampaignNote,
  saveCampaignNote,
} from "@/src/actions/campaignHold";
import type { CampaignNote } from "@/src/types/db/campaignNotes";

export const campaignNoteKey = (campaignId: number | undefined) => [
  "campaign-note",
  campaignId,
];

export function useCampaignNote(campaignId: number | undefined) {
  return useQuery<CampaignNote | null>({
    queryKey: campaignNoteKey(campaignId),
    queryFn: () => readCampaignNote(campaignId),
    enabled: !!campaignId,
  });
}

export function useSaveCampaignNote() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { campaignId: number; note: string }>({
    mutationFn: ({ campaignId, note }) => saveCampaignNote(campaignId, note),
    onSuccess: (_data, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: campaignNoteKey(campaignId) });
    },
  });
}

export function useHoldCampaign() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { campaignId: number; note?: string }>({
    mutationFn: ({ campaignId, note }) => holdCampaign(campaignId, note),
    onSuccess: (_data, { campaignId }) => {
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey.some((part) => part === "campaigns"),
      });
      queryClient.invalidateQueries({ queryKey: campaignNoteKey(campaignId) });
    },
  });
}
