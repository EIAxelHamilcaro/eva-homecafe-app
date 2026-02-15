import { randomUUID } from "node:crypto";
import { match } from "@packages/ddd-kit";
import { db } from "@packages/drizzle";
import { dashboardLayout } from "@packages/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";

const DEFAULT_SECTION_ORDER = [
  "todo",
  "kanban",
  "tableau",
  "chronologie",
  "calendrier",
  "badges",
];

async function getAuthenticatedUser(
  request: Request,
): Promise<IGetSessionOutputDto | null> {
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(request.headers);

  if (result.isFailure) {
    return null;
  }

  return match<IGetSessionOutputDto, IGetSessionOutputDto | null>(
    result.getValue(),
    {
      Some: (session) => session,
      None: () => null,
    },
  );
}

interface DashboardLayoutResponse {
  sectionOrder: string[];
  collapsedSections: string[];
  pinnedBoardIds: string[];
}

export async function getDashboardLayoutController(
  request: Request,
): Promise<NextResponse<DashboardLayoutResponse | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [existing] = await db
    .select()
    .from(dashboardLayout)
    .where(eq(dashboardLayout.userId, session.user.id))
    .limit(1);

  if (existing) {
    return NextResponse.json({
      sectionOrder: existing.sectionOrder as string[],
      collapsedSections: existing.collapsedSections as string[],
      pinnedBoardIds: (existing.pinnedBoardIds as string[]) ?? [],
    });
  }

  return NextResponse.json({
    sectionOrder: DEFAULT_SECTION_ORDER,
    collapsedSections: [],
    pinnedBoardIds: [],
  });
}

export async function updateDashboardLayoutController(
  request: Request,
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    sectionOrder?: string[];
    collapsedSections?: string[];
    pinnedBoardIds?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const userId = session.user.id;

  const [existing] = await db
    .select()
    .from(dashboardLayout)
    .where(eq(dashboardLayout.userId, userId))
    .limit(1);

  if (existing) {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.sectionOrder) updates.sectionOrder = body.sectionOrder;
    if (body.collapsedSections !== undefined)
      updates.collapsedSections = body.collapsedSections;
    if ("pinnedBoardIds" in body) updates.pinnedBoardIds = body.pinnedBoardIds;

    await db
      .update(dashboardLayout)
      .set(updates)
      .where(eq(dashboardLayout.userId, userId));
  } else {
    await db.insert(dashboardLayout).values({
      id: randomUUID(),
      userId,
      sectionOrder: body.sectionOrder ?? DEFAULT_SECTION_ORDER,
      collapsedSections: body.collapsedSections ?? [],
      pinnedBoardIds: body.pinnedBoardIds ?? [],
    });
  }

  return NextResponse.json({ success: true });
}
