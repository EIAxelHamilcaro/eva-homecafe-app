import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const achievementTypeEnum = pgEnum("achievement_type", [
  "sticker",
  "badge",
]);

export const achievementDefinition = pgTable("achievement_definition", {
  id: text("id").primaryKey(),
  type: achievementTypeEnum("type").notNull(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  criteria: jsonb("criteria").notNull().$type<{
    eventType: string;
    threshold: number;
    field: string;
  }>(),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userReward = pgTable(
  "user_reward",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    achievementDefinitionId: text("achievement_definition_id")
      .notNull()
      .references(() => achievementDefinition.id),
    earnedAt: timestamp("earned_at").notNull().defaultNow(),
  },
  (table) => [
    index("user_reward_user_id_idx").on(table.userId),
    unique("user_reward_user_definition_unique").on(
      table.userId,
      table.achievementDefinitionId,
    ),
  ],
);
