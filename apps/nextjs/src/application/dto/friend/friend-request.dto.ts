import { z } from "zod";

export const friendRequestStatusSchema = z.enum([
  "pending",
  "accepted",
  "rejected",
]);

export const friendRequestDtoSchema = z.object({
  id: z.string().min(1),
  senderId: z.string().min(1),
  receiverId: z.string().min(1),
  status: friendRequestStatusSchema,
  createdAt: z.string().datetime(),
  respondedAt: z.string().datetime().nullable(),
});

export const friendDtoSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  email: z.string().email(),
  name: z.string().nullable(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
});

export type IFriendRequestDto = z.infer<typeof friendRequestDtoSchema>;
export type IFriendDto = z.infer<typeof friendDtoSchema>;
