import { z } from "zod";
import { profileDtoSchema } from "./profile.dto";

export const createProfileInputDtoSchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().max(20).optional(),
  birthday: z.string().optional(),
  profession: z.string().max(100).optional(),
  address: z
    .object({
      street: z.string().min(1).max(200),
      zipCode: z.string().min(1).max(20),
      city: z.string().min(1).max(100),
      country: z.string().min(1).max(100),
    })
    .optional(),
});

export const createProfileOutputDtoSchema = profileDtoSchema;

export type ICreateProfileInputDto = z.infer<
  typeof createProfileInputDtoSchema
>;
export type ICreateProfileOutputDto = z.infer<
  typeof createProfileOutputDtoSchema
>;
