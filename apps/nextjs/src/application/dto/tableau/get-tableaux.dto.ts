import { z } from "zod";
import { tableauDtoSchema } from "./common-tableau.dto";

export const getTableauxInputDtoSchema = z.object({
  userId: z.string().min(1),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type IGetTableauxInputDto = z.infer<typeof getTableauxInputDtoSchema>;

export const getTableauxOutputDtoSchema = z.object({
  tableaux: z.array(tableauDtoSchema),
});

export type IGetTableauxOutputDto = z.infer<typeof getTableauxOutputDtoSchema>;
