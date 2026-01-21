import { z } from "zod";

export const attachmentInputSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  mimeType: z.string(),
  size: z.number().positive(),
  filename: z.string().min(1),
  dimensions: z
    .object({
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .optional(),
});

export const sendMessageInputDtoSchema = z.object({
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().optional(),
  attachments: z.array(attachmentInputSchema).optional(),
});

export const sendMessageOutputDtoSchema = z.object({
  messageId: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().nullable(),
  attachments: z.array(attachmentInputSchema),
  createdAt: z.date(),
});

export type IAttachmentInput = z.infer<typeof attachmentInputSchema>;
export type ISendMessageInputDto = z.infer<typeof sendMessageInputDtoSchema>;
export type ISendMessageOutputDto = z.infer<typeof sendMessageOutputDtoSchema>;
