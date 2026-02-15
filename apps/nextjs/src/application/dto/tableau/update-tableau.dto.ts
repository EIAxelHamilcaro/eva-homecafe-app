import { z } from "zod";
import {
  priorityOptionDtoSchema,
  statusOptionDtoSchema,
  tableauColumnDtoSchema,
  type tableauDtoSchema,
} from "./common-tableau.dto";

export const updateTableauInputDtoSchema = z.object({
  tableauId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  statusOptions: z.array(statusOptionDtoSchema).min(1).optional(),
  priorityOptions: z.array(priorityOptionDtoSchema).min(1).optional(),
  columns: z.array(tableauColumnDtoSchema).optional(),
});

export type IUpdateTableauInputDto = z.infer<
  typeof updateTableauInputDtoSchema
>;
export type IUpdateTableauOutputDto = z.infer<typeof tableauDtoSchema>;
