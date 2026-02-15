import { addEntryController } from "@/adapters/controllers/chronologie/chronologie.controller";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chronologieId: string }> },
) {
  const { chronologieId } = await params;
  return addEntryController(request, chronologieId);
}
