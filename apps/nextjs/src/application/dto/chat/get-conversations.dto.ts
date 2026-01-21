import { z } from "zod";

export const getConversationsInputDtoSchema = z.object({
  userId: z.string().min(1),
  pagination: z
    .object({
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
    })
    .optional(),
});

export const participantDtoSchema = z.object({
  userId: z.string().min(1),
  joinedAt: z.date(),
  lastReadAt: z.date().nullable(),
});

export const messagePreviewDtoSchema = z.object({
  messageId: z.string().min(1),
  content: z.string(),
  senderId: z.string().min(1),
  sentAt: z.date(),
  hasAttachments: z.boolean(),
});

export const conversationDtoSchema = z.object({
  id: z.string().min(1),
  participants: z.array(participantDtoSchema),
  createdBy: z.string().min(1),
  lastMessage: messagePreviewDtoSchema.nullable(),
  unreadCount: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getConversationsOutputDtoSchema = z.object({
  conversations: z.array(conversationDtoSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export type IGetConversationsInputDto = z.infer<
  typeof getConversationsInputDtoSchema
>;
export type IGetConversationsOutputDto = z.infer<
  typeof getConversationsOutputDtoSchema
>;
export type IParticipantDto = z.infer<typeof participantDtoSchema>;
export type IMessagePreviewDto = z.infer<typeof messagePreviewDtoSchema>;
export type IConversationDto = z.infer<typeof conversationDtoSchema>;
