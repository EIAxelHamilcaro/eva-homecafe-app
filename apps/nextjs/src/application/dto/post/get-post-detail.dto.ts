import { z } from "zod";

export const getPostDetailInputDtoSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  requestingUserId: z.string().min(1, "Requesting user ID is required"),
});

export type IGetPostDetailInputDto = z.infer<
  typeof getPostDetailInputDtoSchema
>;

export const getPostDetailOutputDtoSchema = z.object({
  id: z.string(),
  content: z.string(),
  isPrivate: z.boolean(),
  images: z.array(z.string()),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type IGetPostDetailOutputDto = z.infer<
  typeof getPostDetailOutputDtoSchema
>;
