import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import { getProfilesBatch } from "@/adapters/queries/profiles-batch.query";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";

async function getAuthenticatedUser(
  request: Request,
): Promise<IGetSessionOutputDto | null> {
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(request.headers);

  if (result.isFailure) return null;

  return match<IGetSessionOutputDto, IGetSessionOutputDto | null>(
    result.getValue(),
    {
      Some: (session) => session,
      None: () => null,
    },
  );
}

export async function profilesBatchController(
  request: Request,
): Promise<NextResponse> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ profiles: [] });
  }

  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json({ profiles: [] });
  }

  if (ids.length > 50) {
    return NextResponse.json(
      { error: "Maximum 50 profiles per request" },
      { status: 400 },
    );
  }

  const profiles = await getProfilesBatch(ids);
  return NextResponse.json({ profiles });
}
