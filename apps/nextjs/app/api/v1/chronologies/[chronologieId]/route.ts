import { deleteChronologieController } from "@/adapters/controllers/chronologie/chronologie.controller";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ chronologieId: string }> },
) {
  const { chronologieId } = await params;
  return deleteChronologieController(request, chronologieId);
}
