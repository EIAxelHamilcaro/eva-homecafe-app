import { z } from "zod";
import type { chronologieDtoSchema } from "./common-chronologie.dto";

export const addEntryInputDtoSchema = z.object({
  chronologieId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1).max(200),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  color: z.number().optional(),
});

export type IAddEntryInputDto = z.infer<typeof addEntryInputDtoSchema>;
export type IAddEntryOutputDto = z.infer<typeof chronologieDtoSchema>;
