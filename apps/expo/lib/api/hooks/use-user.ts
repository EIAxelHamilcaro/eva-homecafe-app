import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import type { User } from "./use-auth";

export const userKeys = {
  all: ["users"] as const,
  detail: (id: string) => [...userKeys.all, id] as const,
  profile: () => [...userKeys.all, "profile"] as const,
};

export interface UpdateProfileInput {
  name?: string;
  image?: string | null;
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => api.get<User>(`/api/users/${userId}`),
    enabled: !!userId,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => api.get<User>("/api/users/profile"),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      api.put<User>("/api/users/profile", input),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.profile(), data);
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete<{ success: boolean }>("/api/users/profile"),
    onSuccess: () => {
      api.setToken(null);
      queryClient.clear();
    },
  });
}
