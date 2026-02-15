"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface DashboardLayoutConfig {
  sectionOrder: string[];
  collapsedSections: string[];
}

export function useDashboardLayoutQuery() {
  return useQuery<DashboardLayoutConfig>({
    queryKey: ["dashboard-layout"],
    queryFn: async () => {
      const res = await fetch("/api/v1/dashboard-layout");
      if (!res.ok) throw new Error("Failed to fetch layout");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateDashboardLayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Partial<DashboardLayoutConfig>>({
    mutationFn: async (updates) => {
      const res = await fetch("/api/v1/dashboard-layout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update layout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-layout"] });
    },
  });
}
