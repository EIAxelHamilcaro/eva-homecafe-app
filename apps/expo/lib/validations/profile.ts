import { z } from "zod";

export const displayNameSchema = z
  .string()
  .min(1, "Le nom d'affichage est requis")
  .max(50, "Maximum 50 caractères");

export const bioSchema = z
  .string()
  .max(500, "Maximum 500 caractères")
  .optional();

export const updateProfileSchema = z.object({
  displayName: displayNameSchema,
  bio: bioSchema,
  avatarUrl: z.string().url().optional().nullable(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
