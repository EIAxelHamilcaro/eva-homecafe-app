import { z } from "zod";
import type { chronologieDtoSchema } from "./common-chronologie.dto";

export const removeEntryInputDtoSchema = z.object({
  chronologieId: z.string().min(1),
  entryId: z.string().min(1),
  userId: z.string().min(1),
});

export type IRemoveEntryInputDto = z.infer<typeof removeEntryInputDtoSchema>;
export type IRemoveEntryOutputDto = z.infer<typeof chronologieDtoSchema>;
