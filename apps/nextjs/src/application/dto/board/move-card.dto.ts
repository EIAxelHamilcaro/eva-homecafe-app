import { z } from "zod";
import { boardDtoSchema } from "./common-board.dto";

export const moveCardInputDtoSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
  cardId: z.string().min(1, "Card ID is required"),
  toColumnId: z.string().min(1, "Target column ID is required"),
  newPosition: z.number().int().min(0),
  userId: z.string().min(1, "User ID is required"),
});

export type IMoveCardInputDto = z.infer<typeof moveCardInputDtoSchema>;

export const moveCardOutputDtoSchema = boardDtoSchema;

export type IMoveCardOutputDto = z.infer<typeof moveCardOutputDtoSchema>;
