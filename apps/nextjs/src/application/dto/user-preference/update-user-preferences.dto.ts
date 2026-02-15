import { z } from "zod";
import { userPreferenceDtoSchema } from "./user-preference.dto";

export const updateUserPreferencesInputDtoSchema = z.object({
  userId: z.string().min(1),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  notifyNewMessages: z.boolean().optional(),
  notifyFriendActivity: z.boolean().optional(),
  notifyBadgesEarned: z.boolean().optional(),
  notifyPostActivity: z.boolean().optional(),
  notifyJournalReminder: z.boolean().optional(),
  profileVisibility: z.boolean().optional(),
  rewardsVisibility: z.enum(["everyone", "friends", "nobody"]).optional(),
  themeMode: z.enum(["light", "dark", "system"]).optional(),
  language: z.enum(["fr", "en"]).optional(),
  timeFormat: z.enum(["12h", "24h"]).optional(),
});

export const updateUserPreferencesOutputDtoSchema = userPreferenceDtoSchema;

export type IUpdateUserPreferencesInputDto = z.infer<
  typeof updateUserPreferencesInputDtoSchema
>;
export type IUpdateUserPreferencesOutputDto = z.infer<
  typeof updateUserPreferencesOutputDtoSchema
>;
