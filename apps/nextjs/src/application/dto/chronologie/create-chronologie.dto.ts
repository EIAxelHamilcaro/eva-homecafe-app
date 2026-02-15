import { z } from "zod";
import type { chronologieDtoSchema } from "./common-chronologie.dto";

export const createChronologieInputDtoSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(100),
});

export type ICreateChronologieInputDto = z.infer<
  typeof createChronologieInputDtoSchema
>;
export type ICreateChronologieOutputDto = z.infer<typeof chronologieDtoSchema>;
