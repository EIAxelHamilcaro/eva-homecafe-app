import { z } from "zod";
import { profileDtoSchema } from "./profile.dto";

export const updateProfileInputDtoSchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  birthday: z.string().nullable().optional(),
  profession: z.string().max(100).nullable().optional(),
  address: z
    .object({
      street: z.string().min(1).max(200),
      zipCode: z.string().min(1).max(20),
      city: z.string().min(1).max(100),
      country: z.string().min(1).max(100),
    })
    .nullable()
    .optional(),
});

export const updateProfileOutputDtoSchema = profileDtoSchema;

export type IUpdateProfileInputDto = z.infer<
  typeof updateProfileInputDtoSchema
>;
export type IUpdateProfileOutputDto = z.infer<
  typeof updateProfileOutputDtoSchema
>;
