import { z } from "zod";

export const statusOptionDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
});

export const priorityOptionDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  level: z.number(),
});

export const columnOptionDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

export const tableauColumnDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    "text",
    "number",
    "checkbox",
    "date",
    "select",
    "status",
    "priority",
    "file",
  ]),
  position: z.number(),
  options: z.array(columnOptionDtoSchema).optional(),
});

export const tableauRowDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  text: z.string().nullable(),
  status: z.string(),
  priority: z.string(),
  date: z.string().nullable(),
  files: z.array(z.string()),
  customFields: z.record(z.string(), z.unknown()),
  position: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export const tableauDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  rows: z.array(tableauRowDtoSchema),
  statusOptions: z.array(statusOptionDtoSchema),
  priorityOptions: z.array(priorityOptionDtoSchema),
  columns: z.array(tableauColumnDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type IStatusOptionDto = z.infer<typeof statusOptionDtoSchema>;
export type IPriorityOptionDto = z.infer<typeof priorityOptionDtoSchema>;
export type ITableauColumnDto = z.infer<typeof tableauColumnDtoSchema>;
export type ITableauRowDto = z.infer<typeof tableauRowDtoSchema>;
export type ITableauDto = z.infer<typeof tableauDtoSchema>;
