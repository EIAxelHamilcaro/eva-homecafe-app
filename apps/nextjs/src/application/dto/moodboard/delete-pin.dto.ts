import { z } from "zod";

export const deletePinInputDtoSchema = z.object({
  moodboardId: z.string().min(1, "Moodboard ID is required"),
  pinId: z.string().min(1, "Pin ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export type IDeletePinInputDto = z.infer<typeof deletePinInputDtoSchema>;

export const deletePinOutputDtoSchema = z.object({
  id: z.string(),
});

export type IDeletePinOutputDto = z.infer<typeof deletePinOutputDtoSchema>;
