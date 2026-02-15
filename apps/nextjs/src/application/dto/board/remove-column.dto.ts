import { z } from "zod";
import type { boardDtoSchema } from "./common-board.dto";

export const removeColumnInputDtoSchema = z.object({
  boardId: z.string(),
  columnId: z.string(),
  userId: z.string(),
});

export type IRemoveColumnInputDto = z.infer<typeof removeColumnInputDtoSchema>;
export type IRemoveColumnOutputDto = z.infer<typeof boardDtoSchema>;
