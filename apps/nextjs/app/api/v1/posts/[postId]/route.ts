import type { NextRequest } from "next/server";
import { getPostDetailController } from "@/adapters/controllers/post/post.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  return getPostDetailController(request, postId);
}
