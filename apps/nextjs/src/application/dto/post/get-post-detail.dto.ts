import { z } from "zod";
import { postDtoSchema } from "./get-user-posts.dto";

export const getPostDetailInputDtoSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  requestingUserId: z.string().min(1, "Requesting user ID is required"),
});

export type IGetPostDetailInputDto = z.infer<
  typeof getPostDetailInputDtoSchema
>;

export const getPostDetailOutputDtoSchema = postDtoSchema;

export type IGetPostDetailOutputDto = z.infer<
  typeof getPostDetailOutputDtoSchema
>;
