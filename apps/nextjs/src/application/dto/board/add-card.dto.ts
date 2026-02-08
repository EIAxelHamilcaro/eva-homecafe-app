import { z } from "zod";
import { boardDtoSchema } from "./common-board.dto";

export const addCardInputDtoSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
  columnId: z.string().min(1, "Column ID is required"),
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Card title is required").max(200),
  description: z.string().max(5000).nullable().optional(),
  progress: z.number().int().min(0).max(100).optional().default(0),
  dueDate: z.string().nullable().optional(),
});

export type IAddCardInputDto = z.infer<typeof addCardInputDtoSchema>;

export const addCardOutputDtoSchema = boardDtoSchema;

export type IAddCardOutputDto = z.infer<typeof addCardOutputDtoSchema>;
