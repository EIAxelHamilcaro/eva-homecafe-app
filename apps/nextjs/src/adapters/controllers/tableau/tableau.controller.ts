import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { addRowInputDtoSchema } from "@/application/dto/tableau/add-row.dto";
import type { ITableauDto } from "@/application/dto/tableau/common-tableau.dto";
import type { ICreateTableauOutputDto } from "@/application/dto/tableau/create-tableau.dto";
import { createTableauInputDtoSchema } from "@/application/dto/tableau/create-tableau.dto";
import type { IDeleteTableauOutputDto } from "@/application/dto/tableau/delete-tableau.dto";
import { deleteTableauInputDtoSchema } from "@/application/dto/tableau/delete-tableau.dto";
import type { IGetTableauxOutputDto } from "@/application/dto/tableau/get-tableaux.dto";
import { removeRowInputDtoSchema } from "@/application/dto/tableau/remove-row.dto";
import { updateRowInputDtoSchema } from "@/application/dto/tableau/update-row.dto";
import { updateTableauInputDtoSchema } from "@/application/dto/tableau/update-tableau.dto";
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

export async function createTableauController(
  request: Request,
): Promise<NextResponse<ICreateTableauOutputDto | { error: string }>> {
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

  const parsed = createTableauInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("CreateTableauUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function getUserTableauxController(
  request: Request,
): Promise<NextResponse<IGetTableauxOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = getInjection("GetUserTableauxUseCase");
  const result = await useCase.execute({ userId: session.user.id });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function deleteTableauController(
  request: Request,
  tableauId: string,
): Promise<NextResponse<IDeleteTableauOutputDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = deleteTableauInputDtoSchema.safeParse({
    tableauId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("DeleteTableauUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Tableau not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function addRowController(
  request: Request,
  tableauId: string,
): Promise<NextResponse<ITableauDto | { error: string }>> {
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

  const parsed = addRowInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    tableauId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("AddTableauRowUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Tableau not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function updateRowController(
  request: Request,
  tableauId: string,
  rowId: string,
): Promise<NextResponse<ITableauDto | { error: string }>> {
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

  const parsed = updateRowInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    tableauId,
    rowId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("UpdateTableauRowUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Tableau not found" || error === "Row not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function removeRowController(
  request: Request,
  tableauId: string,
  rowId: string,
): Promise<NextResponse<ITableauDto | { error: string }>> {
  const session = await getAuthenticatedUser(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = removeRowInputDtoSchema.safeParse({
    tableauId,
    rowId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("RemoveTableauRowUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Tableau not found" || error === "Row not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}

export async function updateTableauController(
  request: Request,
  tableauId: string,
): Promise<NextResponse<ITableauDto | { error: string }>> {
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

  const parsed = updateTableauInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    tableauId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("UpdateTableauUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") {
      return NextResponse.json({ error }, { status: 403 });
    }
    if (error === "Tableau not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(result.getValue());
}
