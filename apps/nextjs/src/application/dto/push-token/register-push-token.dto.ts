import { z } from "zod";

export const registerPushTokenInputDtoSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android"]),
});

export const registerPushTokenOutputDtoSchema = z.object({
  id: z.string(),
});

export type IRegisterPushTokenInputDto = z.infer<
  typeof registerPushTokenInputDtoSchema
>;
export type IRegisterPushTokenOutputDto = z.infer<
  typeof registerPushTokenOutputDtoSchema
>;
