import { z } from "zod";

export const getMessagesInputDtoSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
  pagination: z
    .object({
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
    })
    .optional(),
});

export const attachmentDtoSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  mimeType: z.string(),
  size: z.number(),
  filename: z.string(),
  dimensions: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .nullable(),
});

export const reactionDtoSchema = z.object({
  userId: z.string().uuid(),
  emoji: z.string(),
  createdAt: z.date(),
});

export const messageDtoSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().nullable(),
  attachments: z.array(attachmentDtoSchema),
  reactions: z.array(reactionDtoSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  editedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

export const getMessagesOutputDtoSchema = z.object({
  messages: z.array(messageDtoSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export type IGetMessagesInputDto = z.infer<typeof getMessagesInputDtoSchema>;
export type IGetMessagesOutputDto = z.infer<typeof getMessagesOutputDtoSchema>;
export type IMessageDto = z.infer<typeof messageDtoSchema>;
export type IAttachmentDto = z.infer<typeof attachmentDtoSchema>;
export type IReactionDto = z.infer<typeof reactionDtoSchema>;
