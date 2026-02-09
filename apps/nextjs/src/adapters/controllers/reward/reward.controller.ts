import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import type { RewardCollectionItemDto } from "@/adapters/queries/reward-collection.query";
import {
  getUserBadgeCollection,
  getUserStickerCollection,
} from "@/adapters/queries/reward-collection.query";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";

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

export async function getStickerCollectionController(
  request: Request,
): Promise<NextResponse<RewardCollectionItemDto[] | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stickers = await getUserStickerCollection(session.user.id);
    return NextResponse.json(stickers);
  } catch {
    return NextResponse.json(
      { error: "Failed to load stickers" },
      { status: 500 },
    );
  }
}

export async function getBadgeCollectionController(
  request: Request,
): Promise<NextResponse<RewardCollectionItemDto[] | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const badges = await getUserBadgeCollection(session.user.id);
    return NextResponse.json(badges);
  } catch {
    return NextResponse.json(
      { error: "Failed to load badges" },
      { status: 500 },
    );
  }
}
