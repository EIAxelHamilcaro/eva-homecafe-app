import { z } from "zod";
import { boardTypeValues } from "@/domain/board/value-objects/board-type.vo";

export const cardDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  content: z.string().nullable(),
  isCompleted: z.boolean(),
  position: z.number(),
  progress: z.number(),
  priority: z.string().nullable(),
  tags: z.array(z.string()),
  link: z.string().nullable(),
  dueDate: z.string().nullable(),
  createdAt: z.string(),
});

export const columnDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  position: z.number(),
  cards: z.array(cardDtoSchema),
});

export const boardDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(boardTypeValues),
  description: z.string().nullable(),
  priority: z.string().nullable(),
  dueDate: z.string().nullable(),
  tags: z.array(z.string()),
  link: z.string().nullable(),
  columns: z.array(columnDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type ICardDto = z.infer<typeof cardDtoSchema>;
export type IColumnDto = z.infer<typeof columnDtoSchema>;
export type IBoardDto = z.infer<typeof boardDtoSchema>;
