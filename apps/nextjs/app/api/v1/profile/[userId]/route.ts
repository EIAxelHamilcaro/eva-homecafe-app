import type { NextRequest } from "next/server";
import { getProfileByUserIdController } from "@/adapters/controllers/profile/profile.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  return getProfileByUserIdController(request, userId);
}
