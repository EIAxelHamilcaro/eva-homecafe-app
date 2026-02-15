import { z } from "zod";
import { rowPriorityValues } from "@/domain/tableau/value-objects/row-priority.vo";
import { rowStatusValues } from "@/domain/tableau/value-objects/row-status.vo";
import type { tableauDtoSchema } from "./common-tableau.dto";

export const addRowInputDtoSchema = z.object({
  tableauId: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).max(200),
  text: z.string().optional(),
  status: z.enum(rowStatusValues).optional(),
  priority: z.enum(rowPriorityValues).optional(),
  date: z.string().optional(),
  files: z.array(z.string()).optional(),
});

export type IAddRowInputDto = z.infer<typeof addRowInputDtoSchema>;
export type IAddRowOutputDto = z.infer<typeof tableauDtoSchema>;
