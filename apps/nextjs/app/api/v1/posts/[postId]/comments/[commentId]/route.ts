import type { NextRequest } from "next/server";
import {
  deletePostCommentController,
  updatePostCommentController,
} from "@/adapters/controllers/post/post-comments.controller";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string; commentId: string }> },
) {
  const { postId, commentId } = await params;
  return updatePostCommentController(request, postId, commentId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string; commentId: string }> },
) {
  const { postId, commentId } = await params;
  return deletePostCommentController(request, postId, commentId);
}
