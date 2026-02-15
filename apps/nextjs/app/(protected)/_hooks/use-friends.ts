"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IAcceptInviteOutputDto } from "@/application/dto/friend/accept-invite.dto";
import type { IGetFriendsOutputDto } from "@/application/dto/friend/get-friends.dto";
import type { IGetInviteLinkOutputDto } from "@/application/dto/friend/get-invite-link.dto";
import type { IGetPendingRequestsOutputDto } from "@/application/dto/friend/get-pending-requests.dto";
import type { IRemoveFriendOutputDto } from "@/application/dto/friend/remove-friend.dto";
import type { IRespondFriendRequestOutputDto } from "@/application/dto/friend/respond-friend-request.dto";
import type { ISendFriendRequestOutputDto } from "@/application/dto/friend/send-friend-request.dto";
import type { ISendInviteEmailOutputDto } from "@/application/dto/friend/send-invite-email.dto";
import { apiFetch } from "@/common/api";
import { notificationKeys } from "./use-notifications";

export const friendKeys = {
  all: ["friends"] as const,
  list: (page: number) => ["friends", "list", page] as const,
  requests: (page: number) => ["friends", "requests", page] as const,
  inviteLink: ["friends", "invite-link"] as const,
};

export function useFriendsQuery(page = 1) {
  return useQuery<IGetFriendsOutputDto>({
    queryKey: friendKeys.list(page),
    queryFn: () =>
      apiFetch<IGetFriendsOutputDto>(`/api/v1/friends?page=${page}`),
  });
}

export function usePendingRequestsQuery(page = 1) {
  return useQuery<IGetPendingRequestsOutputDto>({
    queryKey: friendKeys.requests(page),
    queryFn: () =>
      apiFetch<IGetPendingRequestsOutputDto>(
        `/api/v1/friends/requests?page=${page}`,
      ),
  });
}

export function useRespondRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    IRespondFriendRequestOutputDto,
    Error,
    { requestId: string; accept: boolean }
  >({
    mutationFn: ({ requestId, accept }) =>
      apiFetch<IRespondFriendRequestOutputDto>(
        `/api/v1/friends/requests/${requestId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId, accept }),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useSendFriendRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ISendFriendRequestOutputDto,
    Error,
    { receiverEmail: string }
  >({
    mutationFn: ({ receiverEmail }) =>
      apiFetch<ISendFriendRequestOutputDto>("/api/v1/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverEmail }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}

export function useInviteLinkQuery() {
  return useQuery<IGetInviteLinkOutputDto>({
    queryKey: friendKeys.inviteLink,
    queryFn: () => apiFetch<IGetInviteLinkOutputDto>("/api/v1/friends/invite"),
    enabled: false,
  });
}

export function useSendInviteEmailMutation() {
  return useMutation<
    ISendInviteEmailOutputDto,
    Error,
    { recipientEmail: string }
  >({
    mutationFn: ({ recipientEmail }) =>
      apiFetch<ISendInviteEmailOutputDto>("/api/v1/friends/invite/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail }),
      }),
  });
}

export function useRemoveFriendMutation() {
  const queryClient = useQueryClient();

  return useMutation<IRemoveFriendOutputDto, Error, { friendUserId: string }>({
    mutationFn: ({ friendUserId }) =>
      apiFetch<IRemoveFriendOutputDto>("/api/v1/friends/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendUserId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}

export function useAcceptInviteMutation() {
  const queryClient = useQueryClient();

  return useMutation<IAcceptInviteOutputDto, Error, { token: string }>({
    mutationFn: ({ token }) =>
      apiFetch<IAcceptInviteOutputDto>("/api/v1/friends/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.all });
    },
  });
}
