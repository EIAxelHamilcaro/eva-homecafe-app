import { z } from "zod";

export const feedPostAuthorDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

export type IFeedPostAuthorDto = z.infer<typeof feedPostAuthorDtoSchema>;

export const feedPostDtoSchema = z.object({
  id: z.string(),
  content: z.string(),
  images: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  author: feedPostAuthorDtoSchema,
  reactionCount: z.number().int().nonnegative(),
});

export type IFeedPostDto = z.infer<typeof feedPostDtoSchema>;

export const getFriendFeedOutputDtoSchema = z.object({
  data: z.array(feedPostDtoSchema),
  hasFriends: z.boolean(),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export type IGetFriendFeedOutputDto = z.infer<
  typeof getFriendFeedOutputDtoSchema
>;
