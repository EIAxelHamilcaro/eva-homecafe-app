import { z } from "zod";
import { boardDtoSchema } from "./common-board.dto";

export const createBoardInputDtoSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  type: z.enum(["todo", "kanban"]),
  userId: z.string().min(1, "User ID is required"),
  items: z
    .array(z.object({ title: z.string().min(1).max(200) }))
    .optional()
    .default([]),
});

export type ICreateBoardInputDto = z.infer<typeof createBoardInputDtoSchema>;

export const createBoardOutputDtoSchema = boardDtoSchema;

export type ICreateBoardOutputDto = z.infer<typeof createBoardOutputDtoSchema>;
