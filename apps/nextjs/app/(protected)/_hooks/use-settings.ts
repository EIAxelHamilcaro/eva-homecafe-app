"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IGetUserPreferencesOutputDto } from "@/application/dto/user-preference/get-user-preferences.dto";
import type { IUpdateUserPreferencesOutputDto } from "@/application/dto/user-preference/update-user-preferences.dto";
import { apiFetch } from "@/common/api";

export const settingsKeys = {
  all: ["settings"] as const,
};

export function useSettingsQuery() {
  return useQuery<IGetUserPreferencesOutputDto>({
    queryKey: settingsKeys.all,
    queryFn: () => apiFetch<IGetUserPreferencesOutputDto>("/api/v1/settings"),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    IUpdateUserPreferencesOutputDto,
    Error,
    Partial<{
      emailNotifications: boolean;
      pushNotifications: boolean;
      notifyNewMessages: boolean;
      notifyFriendActivity: boolean;
      notifyBadgesEarned: boolean;
      notifyJournalReminder: boolean;
      profileVisibility: boolean;
      rewardsVisibility: "everyone" | "friends" | "nobody";
      themeMode: "light" | "dark" | "system";
      language: "fr" | "en";
      timeFormat: "12h" | "24h";
    }>
  >({
    mutationFn: (settings) =>
      apiFetch<IUpdateUserPreferencesOutputDto>("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
