import { z } from "zod";

export const deletePostInputDtoSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export type IDeletePostInputDto = z.infer<typeof deletePostInputDtoSchema>;

export const deletePostOutputDtoSchema = z.object({
  id: z.string(),
});

export type IDeletePostOutputDto = z.infer<typeof deletePostOutputDtoSchema>;
