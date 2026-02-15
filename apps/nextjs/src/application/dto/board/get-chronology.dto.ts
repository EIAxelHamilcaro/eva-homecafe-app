import { z } from "zod";
import { boardTypeValues } from "@/domain/board/value-objects/board-type.vo";

export const getChronologyInputDtoSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format")
    .optional(),
  months: z.coerce.number().int().min(1).max(12).optional(),
});

export type IGetChronologyInputDto = z.infer<
  typeof getChronologyInputDtoSchema
>;

export const chronologyCardDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  dueDate: z.string(),
  createdAt: z.string(),
  isCompleted: z.boolean(),
  progress: z.number(),
  boardId: z.string(),
  boardTitle: z.string(),
  boardType: z.enum(boardTypeValues),
  columnTitle: z.string(),
});

export type IChronologyCardDto = z.infer<typeof chronologyCardDtoSchema>;

export const eventDateInfoSchema = z.object({
  count: z.number(),
  boards: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
    }),
  ),
});

export const getChronologyOutputDtoSchema = z.object({
  cards: z.array(chronologyCardDtoSchema),
  eventDates: z.record(z.string(), eventDateInfoSchema),
});

export type IGetChronologyOutputDto = z.infer<
  typeof getChronologyOutputDtoSchema
>;
