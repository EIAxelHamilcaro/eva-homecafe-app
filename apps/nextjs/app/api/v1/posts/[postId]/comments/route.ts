import type { NextRequest } from "next/server";
import {
  createPostCommentController,
  getPostCommentsController,
} from "@/adapters/controllers/post/post-comments.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  return createPostCommentController(request, postId);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  return getPostCommentsController(request, postId);
}
