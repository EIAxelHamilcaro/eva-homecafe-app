import { z } from "zod";
import { postDtoSchema } from "@/application/dto/post/get-user-posts.dto";

export const getJournalEntriesInputDtoSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type IGetJournalEntriesInputDto = z.infer<
  typeof getJournalEntriesInputDtoSchema
>;

export const journalEntryGroupDtoSchema = z.object({
  date: z.string(),
  posts: z.array(postDtoSchema),
});

export type IJournalEntryGroupDto = z.infer<typeof journalEntryGroupDtoSchema>;

export const getJournalEntriesOutputDtoSchema = z.object({
  groups: z.array(journalEntryGroupDtoSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export type IGetJournalEntriesOutputDto = z.infer<
  typeof getJournalEntriesOutputDtoSchema
>;
