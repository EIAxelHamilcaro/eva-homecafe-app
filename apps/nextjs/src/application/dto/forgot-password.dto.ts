import z from "zod";

export const forgotPasswordInputDtoSchema = z.object({
  email: z.email(),
  redirectTo: z.string().optional(),
});

export type IForgotPasswordInputDto = z.infer<
  typeof forgotPasswordInputDtoSchema
>;
