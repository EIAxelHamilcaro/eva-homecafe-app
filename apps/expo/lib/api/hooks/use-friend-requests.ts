import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  FriendRequest,
  GetPendingRequestsResponse,
  RespondFriendRequestInput,
} from "@/types/friend";
import { api } from "../client";
import { friendKeys, friendRequestKeys } from "./query-keys";

export { friendRequestKeys };

export function usePendingRequests(page = 1, limit = 20) {
  return useQuery({
    queryKey: friendRequestKeys.pending(page, limit),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      return api.get<GetPendingRequestsResponse>(
        `/api/v1/friends/requests?${params}`,
      );
    },
    staleTime: 1000 * 60,
  });
}

export function useRespondRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, accept }: RespondFriendRequestInput) =>
      api.post<{ request: FriendRequest }>(
        `/api/v1/friends/requests/${requestId}/respond`,
        { requestId, accept },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}
