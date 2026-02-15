import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import { addEntryInputDtoSchema } from "@/application/dto/chronologie/add-entry.dto";
import type { IChronologieDto } from "@/application/dto/chronologie/common-chronologie.dto";
import type { ICreateChronologieOutputDto } from "@/application/dto/chronologie/create-chronologie.dto";
import { createChronologieInputDtoSchema } from "@/application/dto/chronologie/create-chronologie.dto";
import type { IDeleteChronologieOutputDto } from "@/application/dto/chronologie/delete-chronologie.dto";
import { deleteChronologieInputDtoSchema } from "@/application/dto/chronologie/delete-chronologie.dto";
import type { IGetChronologiesOutputDto } from "@/application/dto/chronologie/get-chronologies.dto";
import { removeEntryInputDtoSchema } from "@/application/dto/chronologie/remove-entry.dto";
import { updateEntryInputDtoSchema } from "@/application/dto/chronologie/update-entry.dto";
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

export async function createChronologieController(
  request: Request,
): Promise<NextResponse<ICreateChronologieOutputDto | { error: string }>> {
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

  const parsed = createChronologieInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("CreateChronologieUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function getUserChronologiesController(
  request: Request,
): Promise<NextResponse<IGetChronologiesOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = getInjection("GetUserChronologiesUseCase");
  const result = await useCase.execute({ userId: session.user.id });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function deleteChronologieController(
  request: Request,
  chronologieId: string,
): Promise<NextResponse<IDeleteChronologieOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = deleteChronologieInputDtoSchema.safeParse({
    chronologieId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("DeleteChronologieUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Chronologie not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function addEntryController(
  request: Request,
  chronologieId: string,
): Promise<NextResponse<IChronologieDto | { error: string }>> {
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

  const parsed = addEntryInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    chronologieId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("AddChronologieEntryUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Chronologie not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function updateEntryController(
  request: Request,
  chronologieId: string,
  entryId: string,
): Promise<NextResponse<IChronologieDto | { error: string }>> {
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

  const parsed = updateEntryInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    chronologieId,
    entryId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("UpdateChronologieEntryUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Chronologie not found" || error === "Entry not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function removeEntryController(
  request: Request,
  chronologieId: string,
  entryId: string,
): Promise<NextResponse<IChronologieDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = removeEntryInputDtoSchema.safeParse({
    chronologieId,
    entryId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("RemoveChronologieEntryUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Chronologie not found" || error === "Entry not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}
