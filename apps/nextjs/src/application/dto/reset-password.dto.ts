import z from "zod";

export const resetPasswordInputDtoSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export type IResetPasswordInputDto = z.infer<
  typeof resetPasswordInputDtoSchema
>;
