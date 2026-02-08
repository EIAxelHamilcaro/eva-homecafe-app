import { z } from "zod";
import { boardDtoSchema } from "./common-board.dto";

export const updateBoardInputDtoSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1).max(100).optional(),
  addCards: z.array(z.object({ title: z.string().min(1).max(200) })).optional(),
  removeCardIds: z.array(z.string()).optional(),
  toggleCardIds: z.array(z.string()).optional(),
});

export type IUpdateBoardInputDto = z.infer<typeof updateBoardInputDtoSchema>;

export const updateBoardOutputDtoSchema = boardDtoSchema;

export type IUpdateBoardOutputDto = z.infer<typeof updateBoardOutputDtoSchema>;
