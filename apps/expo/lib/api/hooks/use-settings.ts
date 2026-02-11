import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateSettingsInput, UserPreferences } from "@/types/settings";
import { api } from "../client";
import { settingsKeys } from "./query-keys";

export { settingsKeys };

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.my(),
    queryFn: () => api.get<UserPreferences>("/api/v1/settings"),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSettingsInput) =>
      api.patch<UserPreferences>("/api/v1/settings", input),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.my(), data);
    },
  });
}
