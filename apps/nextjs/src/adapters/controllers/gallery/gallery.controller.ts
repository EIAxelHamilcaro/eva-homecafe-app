import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import {
  type GetUserGalleryOutputDto,
  getUserGallery,
} from "@/adapters/queries/gallery.query";
import type { IAddPhotoOutputDto } from "@/application/dto/gallery/add-photo.dto";
import { addPhotoInputDtoSchema } from "@/application/dto/gallery/add-photo.dto";
import type { IDeletePhotoOutputDto } from "@/application/dto/gallery/delete-photo.dto";
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

export async function getUserGalleryController(
  request: Request,
): Promise<NextResponse<GetUserGalleryOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pageRaw = url.searchParams.get("page");
  const limitRaw = url.searchParams.get("limit");
  const page = pageRaw ? Number.parseInt(pageRaw, 10) : Number.NaN;
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : Number.NaN;

  try {
    const result = await getUserGallery(
      session.user.id,
      page > 0 ? page : undefined,
      limit > 0 && limit <= 100 ? limit : undefined,
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load gallery" },
      { status: 500 },
    );
  }
}

export async function addPhotoController(
  request: Request,
): Promise<NextResponse<IAddPhotoOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = addPhotoInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("AddPhotoUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function deletePhotoController(
  request: Request,
  photoId: string,
): Promise<NextResponse<IDeletePhotoOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = getInjection("DeletePhotoUseCase");
  const result = await useCase.execute({
    photoId,
    userId: session.user.id,
  });

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Photo not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}
