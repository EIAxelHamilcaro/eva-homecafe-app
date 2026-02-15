import { addRowController } from "@/adapters/controllers/tableau/tableau.controller";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tableauId: string }> },
) {
  const { tableauId } = await params;
  return addRowController(request, tableauId);
}
