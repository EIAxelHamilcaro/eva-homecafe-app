import { z } from "zod";

export const deleteChronologieInputDtoSchema = z.object({
  chronologieId: z.string().min(1),
  userId: z.string().min(1),
});

export type IDeleteChronologieInputDto = z.infer<
  typeof deleteChronologieInputDtoSchema
>;

export const deleteChronologieOutputDtoSchema = z.object({
  deletedId: z.string(),
});

export type IDeleteChronologieOutputDto = z.infer<
  typeof deleteChronologieOutputDtoSchema
>;
