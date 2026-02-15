import z from "zod";
import { boardDtoSchema } from "./common-board.dto";

export const removeCardInputDtoSchema = z.object({
  boardId: z.string().uuid(),
  cardId: z.string().uuid(),
  userId: z.string(),
});

export type IRemoveCardInputDto = z.infer<typeof removeCardInputDtoSchema>;

export const removeCardOutputDtoSchema = boardDtoSchema;

export type IRemoveCardOutputDto = z.infer<typeof removeCardOutputDtoSchema>;
