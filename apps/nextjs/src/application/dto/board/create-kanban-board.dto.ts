import { z } from "zod";
import { boardDtoSchema } from "./common-board.dto";

export const createKanbanBoardInputDtoSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  userId: z.string().min(1, "User ID is required"),
  columns: z
    .array(z.object({ title: z.string().min(1).max(100) }))
    .optional()
    .default([]),
});

export type ICreateKanbanBoardInputDto = z.infer<
  typeof createKanbanBoardInputDtoSchema
>;

export const createKanbanBoardOutputDtoSchema = boardDtoSchema;

export type ICreateKanbanBoardOutputDto = z.infer<
  typeof createKanbanBoardOutputDtoSchema
>;
