import { z } from "zod";

export const deleteTableauInputDtoSchema = z.object({
  tableauId: z.string().min(1),
  userId: z.string().min(1),
});

export type IDeleteTableauInputDto = z.infer<
  typeof deleteTableauInputDtoSchema
>;

export const deleteTableauOutputDtoSchema = z.object({
  id: z.string(),
});

export type IDeleteTableauOutputDto = z.infer<
  typeof deleteTableauOutputDtoSchema
>;
