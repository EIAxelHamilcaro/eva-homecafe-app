import { z } from "zod";

export const chronologieEntryDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  color: z.number(),
  position: z.number(),
});

export const chronologieDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  entries: z.array(chronologieEntryDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type IChronologieEntryDto = z.infer<typeof chronologieEntryDtoSchema>;
export type IChronologieDto = z.infer<typeof chronologieDtoSchema>;
