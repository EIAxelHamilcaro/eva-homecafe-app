import { z } from "zod";

export const deleteBoardInputDtoSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export type IDeleteBoardInputDto = z.infer<typeof deleteBoardInputDtoSchema>;

export const deleteBoardOutputDtoSchema = z.object({
  id: z.string(),
});

export type IDeleteBoardOutputDto = z.infer<typeof deleteBoardOutputDtoSchema>;
