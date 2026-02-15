import { z } from "zod";

export const userPreferenceDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  notifyNewMessages: z.boolean(),
  notifyFriendActivity: z.boolean(),
  notifyBadgesEarned: z.boolean(),
  notifyPostActivity: z.boolean(),
  notifyJournalReminder: z.boolean(),
  profileVisibility: z.boolean(),
  rewardsVisibility: z.enum(["everyone", "friends", "nobody"]),
  themeMode: z.enum(["light", "dark", "system"]),
  language: z.enum(["fr", "en"]),
  timeFormat: z.enum(["12h", "24h"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type IUserPreferenceDto = z.infer<typeof userPreferenceDtoSchema>;
