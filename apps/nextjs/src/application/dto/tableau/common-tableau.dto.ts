import { z } from "zod";
import { rowPriorityValues } from "@/domain/tableau/value-objects/row-priority.vo";
import { rowStatusValues } from "@/domain/tableau/value-objects/row-status.vo";

export const tableauRowDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  text: z.string().nullable(),
  status: z.enum(rowStatusValues),
  priority: z.enum(rowPriorityValues),
  date: z.string().nullable(),
  files: z.array(z.string()),
  position: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export const tableauDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  rows: z.array(tableauRowDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type ITableauRowDto = z.infer<typeof tableauRowDtoSchema>;
export type ITableauDto = z.infer<typeof tableauDtoSchema>;
