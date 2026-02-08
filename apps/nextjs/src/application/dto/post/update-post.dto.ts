import { z } from "zod";
import { postDtoSchema } from "./get-user-posts.dto";

export const updatePostInputDtoSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  userId: z.string().min(1, "User ID is required"),
  content: z.string().optional(),
  isPrivate: z.boolean().optional(),
  images: z
    .array(z.string().url("Invalid image URL"))
    .max(10, "Maximum 10 images allowed")
    .optional(),
});

export type IUpdatePostInputDto = z.infer<typeof updatePostInputDtoSchema>;

export const updatePostOutputDtoSchema = postDtoSchema;

export type IUpdatePostOutputDto = z.infer<typeof updatePostOutputDtoSchema>;
