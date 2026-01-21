import { z } from "zod";
import { profileDtoSchema } from "./profile.dto";

export const getProfileInputDtoSchema = z.object({
  userId: z.string().min(1),
});

export const getProfileOutputDtoSchema = profileDtoSchema.nullable();

export type IGetProfileInputDto = z.infer<typeof getProfileInputDtoSchema>;
export type IGetProfileOutputDto = z.infer<typeof getProfileOutputDtoSchema>;
