import { z } from "zod";

export const deletePhotoInputDtoSchema = z.object({
  photoId: z.string().min(1, "Photo ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export type IDeletePhotoInputDto = z.infer<typeof deletePhotoInputDtoSchema>;

export const deletePhotoOutputDtoSchema = z.object({
  id: z.string(),
});

export type IDeletePhotoOutputDto = z.infer<typeof deletePhotoOutputDtoSchema>;
