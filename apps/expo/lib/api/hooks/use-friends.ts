import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GetFriendsResponse,
  SendFriendRequestInput,
} from "@/types/friend";
import { api } from "../client";
import { friendKeys, friendRequestKeys } from "./query-keys";

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
      api.post<{ request: { id: string } }>("/api/v1/friends", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendRequestKeys.all });
    },
  });
}
