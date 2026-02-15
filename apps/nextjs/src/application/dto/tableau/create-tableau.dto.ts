import { z } from "zod";
import type { tableauDtoSchema } from "./common-tableau.dto";

export const createTableauInputDtoSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(100),
});

export type ICreateTableauInputDto = z.infer<
  typeof createTableauInputDtoSchema
>;
export type ICreateTableauOutputDto = z.infer<typeof tableauDtoSchema>;
