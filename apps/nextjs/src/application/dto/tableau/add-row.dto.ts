import { z } from "zod";
import type { tableauDtoSchema } from "./common-tableau.dto";

export const addRowInputDtoSchema = z.object({
  tableauId: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).max(200),
  text: z.string().optional(),
  status: z.string().min(1).optional(),
  priority: z.string().min(1).optional(),
  date: z.string().optional(),
  files: z.array(z.string()).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export type IAddRowInputDto = z.infer<typeof addRowInputDtoSchema>;
export type IAddRowOutputDto = z.infer<typeof tableauDtoSchema>;
