import type { NextRequest } from "next/server";
import {
  getPostReactionsController,
  togglePostReactionController,
} from "@/adapters/controllers/post/post-reactions.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  return togglePostReactionController(request, postId);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  return getPostReactionsController(request, postId);
}
