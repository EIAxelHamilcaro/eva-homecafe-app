import { z } from "zod";

export const sendContactMessageInputDtoSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be at most 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be at most 5000 characters"),
});

export type ISendContactMessageInputDto = z.infer<
  typeof sendContactMessageInputDtoSchema
>;
