import { z } from "zod";
import { userPreferenceDtoSchema } from "./user-preference.dto";

export const getUserPreferencesInputDtoSchema = z.object({
  userId: z.string().min(1),
});

export const getUserPreferencesOutputDtoSchema = userPreferenceDtoSchema;

export type IGetUserPreferencesInputDto = z.infer<
  typeof getUserPreferencesInputDtoSchema
>;
export type IGetUserPreferencesOutputDto = z.infer<
  typeof getUserPreferencesOutputDtoSchema
>;
