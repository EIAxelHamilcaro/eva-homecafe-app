import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { profileKeys } from "./query-keys";

interface ProfileBatchResponse {
  profiles: Array<{ id: string; name: string; image: string | null }>;
}

export function useProfilesQuery(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)].sort();

  return useQuery<ProfileBatchResponse>({
    queryKey: profileKeys.batch(uniqueIds),
    queryFn: () =>
      api.get<ProfileBatchResponse>(
        `/api/v1/profiles?ids=${uniqueIds.join(",")}`,
      ),
    enabled: uniqueIds.length > 0,
    staleTime: 5 * 60_000,
  });
}
