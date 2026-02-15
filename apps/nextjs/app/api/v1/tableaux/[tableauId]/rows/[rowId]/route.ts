import {
  removeRowController,
  updateRowController,
} from "@/adapters/controllers/tableau/tableau.controller";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tableauId: string; rowId: string }> },
) {
  const { tableauId, rowId } = await params;
  return updateRowController(request, tableauId, rowId);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tableauId: string; rowId: string }> },
) {
  const { tableauId, rowId } = await params;
  return removeRowController(request, tableauId, rowId);
}
