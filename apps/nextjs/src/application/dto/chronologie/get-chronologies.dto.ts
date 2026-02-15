import { z } from "zod";
import { chronologieDtoSchema } from "./common-chronologie.dto";

export const getChronologiesInputDtoSchema = z.object({
  userId: z.string().min(1),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type IGetChronologiesInputDto = z.infer<
  typeof getChronologiesInputDtoSchema
>;

export const getChronologiesOutputDtoSchema = z.object({
  chronologies: z.array(chronologieDtoSchema),
});

export type IGetChronologiesOutputDto = z.infer<
  typeof getChronologiesOutputDtoSchema
>;
