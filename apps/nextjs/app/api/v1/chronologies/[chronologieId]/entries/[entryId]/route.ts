import {
  removeEntryController,
  updateEntryController,
} from "@/adapters/controllers/chronologie/chronologie.controller";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ chronologieId: string; entryId: string }> },
) {
  const { chronologieId, entryId } = await params;
  return updateEntryController(request, chronologieId, entryId);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ chronologieId: string; entryId: string }> },
) {
  const { chronologieId, entryId } = await params;
  return removeEntryController(request, chronologieId, entryId);
}
