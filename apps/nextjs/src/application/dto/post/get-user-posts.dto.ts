import { z } from "zod";

export const getUserPostsInputDtoSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type IGetUserPostsInputDto = z.infer<typeof getUserPostsInputDtoSchema>;

export const postDtoSchema = z.object({
  id: z.string(),
  content: z.string(),
  isPrivate: z.boolean(),
  images: z.array(z.string()),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  reactionCount: z.number().int().nonnegative().default(0),
  hasReacted: z.boolean().default(false),
  commentCount: z.number().int().nonnegative().default(0),
});

export type IPostDto = z.infer<typeof postDtoSchema>;

export const getUserPostsOutputDtoSchema = z.object({
  posts: z.array(postDtoSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export type IGetUserPostsOutputDto = z.infer<
  typeof getUserPostsOutputDtoSchema
>;
