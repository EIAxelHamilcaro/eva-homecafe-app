import { z } from "zod";
import type { chronologieDtoSchema } from "./common-chronologie.dto";

export const updateEntryInputDtoSchema = z.object({
  chronologieId: z.string().min(1),
  entryId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  color: z.number().optional(),
});

export type IUpdateEntryInputDto = z.infer<typeof updateEntryInputDtoSchema>;
export type IUpdateEntryOutputDto = z.infer<typeof chronologieDtoSchema>;
