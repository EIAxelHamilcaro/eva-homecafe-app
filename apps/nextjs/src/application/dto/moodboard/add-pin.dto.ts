import { z } from "zod";

const baseFields = {
  moodboardId: z.string().min(1, "Moodboard ID is required"),
  userId: z.string().min(1, "User ID is required"),
};

export const addPinInputDtoSchema = z.discriminatedUnion("type", [
  z.object({
    ...baseFields,
    type: z.literal("image"),
    imageUrl: z.string().url("Image URL must be a valid URL"),
    color: z.string().optional(),
  }),
  z.object({
    ...baseFields,
    type: z.literal("color"),
    color: z.string().min(1, "Color is required for color pins"),
    imageUrl: z.string().optional(),
  }),
]);

export type IAddPinInputDto = z.infer<typeof addPinInputDtoSchema>;

export const addPinOutputDtoSchema = z.object({
  id: z.string(),
  type: z.string(),
  imageUrl: z.string().nullable(),
  color: z.string().nullable(),
  position: z.number(),
  createdAt: z.string(),
});

export type IAddPinOutputDto = z.infer<typeof addPinOutputDtoSchema>;
