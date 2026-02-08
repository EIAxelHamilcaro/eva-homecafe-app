import { z } from "zod";
import { boardDtoSchema } from "./common-board.dto";

export type { IBoardDto } from "./common-board.dto";

export const getBoardsInputDtoSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(["todo", "kanban"]).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type IGetBoardsInputDto = z.infer<typeof getBoardsInputDtoSchema>;

export const getBoardsOutputDtoSchema = z.object({
  boards: z.array(boardDtoSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export type IGetBoardsOutputDto = z.infer<typeof getBoardsOutputDtoSchema>;
