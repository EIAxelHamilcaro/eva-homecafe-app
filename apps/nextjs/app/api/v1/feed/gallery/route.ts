import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import {
  type GetFeedGalleryOutputDto,
  getFeedGallery,
} from "@/adapters/queries/feed-gallery.query";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";

export async function GET(
  request: Request,
): Promise<NextResponse<GetFeedGalleryOutputDto | { error: string }>> {
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(request.headers);

  if (result.isFailure) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = match<IGetSessionOutputDto, IGetSessionOutputDto | null>(
    result.getValue(),
    {
      Some: (s) => s,
      None: () => null,
    },
  );

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pageRaw = url.searchParams.get("page");
  const limitRaw = url.searchParams.get("limit");

  const page = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 20;

  try {
    const data = await getFeedGallery(
      session.user.id,
      page > 0 ? page : 1,
      limit > 0 && limit <= 100 ? limit : 20,
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to load gallery" },
      { status: 500 },
    );
  }
}
