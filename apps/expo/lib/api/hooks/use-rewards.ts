import { useQuery } from "@tanstack/react-query";

import type { RewardCollectionItemDto } from "@/types/reward";
import { api } from "../client";
import { rewardKeys } from "./query-keys";

export function useStickers() {
  return useQuery({
    queryKey: rewardKeys.stickers(),
    queryFn: () =>
      api.get<RewardCollectionItemDto[]>("/api/v1/rewards/stickers"),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
  });
}

export function useBadges() {
  return useQuery({
    queryKey: rewardKeys.badges(),
    queryFn: () => api.get<RewardCollectionItemDto[]>("/api/v1/rewards/badges"),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
  });
}
