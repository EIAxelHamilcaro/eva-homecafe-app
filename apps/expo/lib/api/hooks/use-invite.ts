import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AcceptInviteInput, InviteLink } from "@/types/friend";
import { api } from "../client";
import { friendKeys, inviteKeys } from "./query-keys";

export { inviteKeys };

export function useGenerateInvite() {
  return useQuery({
    queryKey: inviteKeys.myInvite(),
    queryFn: () => api.get<InviteLink>("/api/v1/friends/invite"),
    staleTime: 1000 * 60 * 60,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AcceptInviteInput) =>
      api.post<{ friendId: string }>("/api/v1/friends/invite/accept", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}
