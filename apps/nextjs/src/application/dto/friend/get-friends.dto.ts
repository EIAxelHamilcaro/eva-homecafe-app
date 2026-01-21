import { z } from "zod";
import { friendDtoSchema } from "./friend-request.dto";

export const getFriendsInputDtoSchema = z.object({
  userId: z.string().min(1),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export const getFriendsOutputDtoSchema = z.object({
  friends: z.array(friendDtoSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export type IGetFriendsInputDto = z.infer<typeof getFriendsInputDtoSchema>;
export type IGetFriendsOutputDto = z.infer<typeof getFriendsOutputDtoSchema>;
