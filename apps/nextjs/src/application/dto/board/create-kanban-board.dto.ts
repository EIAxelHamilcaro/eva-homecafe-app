import { z } from "zod";
import { boardDtoSchema } from "./common-board.dto";

export const createKanbanBoardInputDtoSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  userId: z.string().min(1, "User ID is required"),
  columns: z
    .array(z.object({ title: z.string().min(1).max(100) }))
    .optional()
    .default([]),
  description: z.string().max(5000).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string().max(50)).optional().default([]),
  link: z.string().max(2000).optional(),
});

export type ICreateKanbanBoardInputDto = z.input<
  typeof createKanbanBoardInputDtoSchema
>;

export const createKanbanBoardOutputDtoSchema = boardDtoSchema;

export type ICreateKanbanBoardOutputDto = z.infer<
  typeof createKanbanBoardOutputDtoSchema
>;
