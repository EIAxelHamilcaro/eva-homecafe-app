import { z } from "zod";
import { boardDtoSchema } from "./common-board.dto";

export const updateCardInputDtoSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
  cardId: z.string().min(1, "Card ID is required"),
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  content: z.string().max(10000).nullable().optional(),
  progress: z.number().int().min(0).max(100).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).nullable().optional(),
  tags: z.array(z.string().max(50)).optional(),
  link: z.string().max(2000).nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export type IUpdateCardInputDto = z.infer<typeof updateCardInputDtoSchema>;

export const updateCardOutputDtoSchema = boardDtoSchema;

export type IUpdateCardOutputDto = z.infer<typeof updateCardOutputDtoSchema>;
