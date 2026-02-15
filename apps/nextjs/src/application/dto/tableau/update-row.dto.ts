import { z } from "zod";
import type { tableauDtoSchema } from "./common-tableau.dto";

export const updateRowInputDtoSchema = z.object({
  tableauId: z.string().min(1),
  rowId: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  text: z.string().optional(),
  status: z.string().min(1).optional(),
  priority: z.string().min(1).optional(),
  date: z.string().optional(),
  files: z.array(z.string()).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export type IUpdateRowInputDto = z.infer<typeof updateRowInputDtoSchema>;
export type IUpdateRowOutputDto = z.infer<typeof tableauDtoSchema>;
