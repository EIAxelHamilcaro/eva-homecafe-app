import { deleteTableauController } from "@/adapters/controllers/tableau/tableau.controller";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tableauId: string }> },
) {
  const { tableauId } = await params;
  return deleteTableauController(request, tableauId);
}
