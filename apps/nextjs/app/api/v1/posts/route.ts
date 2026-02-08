import {
  createPostController,
  getUserPostsController,
} from "@/adapters/controllers/post/post.controller";

export const GET = getUserPostsController;
export const POST = createPostController;
