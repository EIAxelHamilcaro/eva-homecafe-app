import { z } from "zod";
import type { boardDtoSchema } from "./common-board.dto";

export const updateColumnInputDtoSchema = z.object({
  boardId: z.string(),
  columnId: z.string(),
  userId: z.string(),
  title: z.string().min(1).max(100).optional(),
  color: z.number().min(0).max(4).nullable().optional(),
});

export type IUpdateColumnInputDto = z.infer<typeof updateColumnInputDtoSchema>;
export type IUpdateColumnOutputDto = z.infer<typeof boardDtoSchema>;
