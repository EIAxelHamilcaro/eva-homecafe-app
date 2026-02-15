import { z } from "zod";
import type { tableauDtoSchema } from "./common-tableau.dto";

export const removeRowInputDtoSchema = z.object({
  tableauId: z.string().min(1),
  rowId: z.string().min(1),
  userId: z.string().min(1),
});

export type IRemoveRowInputDto = z.infer<typeof removeRowInputDtoSchema>;
export type IRemoveRowOutputDto = z.infer<typeof tableauDtoSchema>;
