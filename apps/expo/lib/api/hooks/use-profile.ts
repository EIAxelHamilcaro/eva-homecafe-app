import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../client";
import type {
  Profile,
  CreateProfileInput,
  UpdateProfileInput,
} from "@/types/profile";

export const profileKeys = {
  all: ["profiles"] as const,
  myProfile: () => [...profileKeys.all, "me"] as const,
  byUserId: (userId: string) => [...profileKeys.all, "user", userId] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.myProfile(),
    queryFn: async () => {
      try {
        return await api.get<Profile>("/api/v1/profile");
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useProfileByUserId(userId: string) {
  return useQuery({
    queryKey: profileKeys.byUserId(userId),
    queryFn: async () => {
      try {
        return await api.get<Profile>(`/api/v1/profile/${userId}`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProfileInput) =>
      api.post<Profile>("/api/v1/profile", input),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.myProfile(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.byUserId(data.userId) });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      api.patch<Profile>("/api/v1/profile", input),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.myProfile(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.byUserId(data.userId) });
    },
  });
}

export function useEnsureProfile() {
  const profileQuery = useProfile();
  const createMutation = useCreateProfile();

  const ensureProfile = async (defaultDisplayName: string) => {
    if (profileQuery.data) {
      return profileQuery.data;
    }

    if (profileQuery.data === null && !createMutation.isPending) {
      const newProfile = await createMutation.mutateAsync({
        displayName: defaultDisplayName,
      });
      return newProfile;
    }

    return null;
  };

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading || createMutation.isPending,
    isError: profileQuery.isError && !createMutation.isPending,
    error: profileQuery.error,
    ensureProfile,
    createMutation,
  };
}
