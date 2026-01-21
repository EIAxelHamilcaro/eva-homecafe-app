import { z } from "zod";

export const profileDtoSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  displayName: z.string().min(1).max(50),
  bio: z.string().max(500).nullable(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type IProfileDto = z.infer<typeof profileDtoSchema>;
