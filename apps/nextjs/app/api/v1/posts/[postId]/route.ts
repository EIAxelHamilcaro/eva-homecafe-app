import type { NextRequest } from "next/server";
import {
  deletePostController,
  getPostDetailController,
  updatePostController,
} from "@/adapters/controllers/post/post.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  return getPostDetailController(request, postId);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  return updatePostController(request, postId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  return deletePostController(request, postId);
}
