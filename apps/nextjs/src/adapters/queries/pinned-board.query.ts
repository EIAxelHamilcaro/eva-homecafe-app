import { db } from "@packages/drizzle";
import { dashboardLayout } from "@packages/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getPinnedBoardIds(userId: string): Promise<string[]> {
  const [row] = await db
    .select({ pinnedBoardIds: dashboardLayout.pinnedBoardIds })
    .from(dashboardLayout)
    .where(eq(dashboardLayout.userId, userId))
    .limit(1);

  return (row?.pinnedBoardIds as string[]) ?? [];
}
