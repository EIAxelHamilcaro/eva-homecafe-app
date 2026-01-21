import { z } from "zod";
import { profileDtoSchema } from "./profile.dto";

export const createProfileInputDtoSchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export const createProfileOutputDtoSchema = profileDtoSchema;

export type ICreateProfileInputDto = z.infer<
  typeof createProfileInputDtoSchema
>;
export type ICreateProfileOutputDto = z.infer<
  typeof createProfileOutputDtoSchema
>;
