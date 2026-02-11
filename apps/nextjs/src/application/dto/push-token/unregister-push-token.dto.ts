import { z } from "zod";

export const unregisterPushTokenInputDtoSchema = z.object({
  token: z.string().min(1),
});

export const unregisterPushTokenOutputDtoSchema = z.object({
  success: z.boolean(),
});

export type IUnregisterPushTokenInputDto = z.infer<
  typeof unregisterPushTokenInputDtoSchema
>;
export type IUnregisterPushTokenOutputDto = z.infer<
  typeof unregisterPushTokenOutputDtoSchema
>;
