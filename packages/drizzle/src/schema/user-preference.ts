import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userPreference = pgTable(
  "user_preference",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    emailNotifications: boolean("email_notifications").notNull().default(true),
    pushNotifications: boolean("push_notifications").notNull().default(true),
    notifyNewMessages: boolean("notify_new_messages").notNull().default(true),
    notifyFriendActivity: boolean("notify_friend_activity")
      .notNull()
      .default(true),
    notifyBadgesEarned: boolean("notify_badges_earned").notNull().default(true),
    notifyPostActivity: boolean("notify_post_activity").notNull().default(true),
    notifyJournalReminder: boolean("notify_journal_reminder")
      .notNull()
      .default(true),
    profileVisibility: boolean("profile_visibility").notNull().default(true),
    rewardsVisibility: text("rewards_visibility").notNull().default("friends"),
    themeMode: text("theme_mode").notNull().default("system"),
    language: text("language").notNull().default("fr"),
    timeFormat: text("time_format").notNull().default("24h"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("user_preference_user_id_idx").on(table.userId)],
);
