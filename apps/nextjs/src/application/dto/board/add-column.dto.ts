import { z } from "zod";
import { boardDtoSchema } from "./common-board.dto";

export const addColumnInputDtoSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Column title is required").max(100),
});

export type IAddColumnInputDto = z.infer<typeof addColumnInputDtoSchema>;

export const addColumnOutputDtoSchema = boardDtoSchema;

export type IAddColumnOutputDto = z.infer<typeof addColumnOutputDtoSchema>;
