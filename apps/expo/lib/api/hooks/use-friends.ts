import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GetFriendsResponse,
  SendFriendRequestInput,
  SendFriendRequestResponse,
} from "@/types/friend";
import { api } from "../client";
import { friendKeys, friendRequestKeys, notificationKeys } from "./query-keys";

export { friendKeys };

export function useFriends(page = 1, limit = 20) {
  return useQuery({
    queryKey: friendKeys.list(page, limit),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      return api.get<GetFriendsResponse>(`/api/v1/friends?${params}`);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendFriendRequestInput) =>
      api.post<SendFriendRequestResponse>("/api/v1/friends", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}

export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ friendUserId }: { friendUserId: string }) =>
      api.post<{ success: boolean }>("/api/v1/friends/remove", {
        friendUserId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
