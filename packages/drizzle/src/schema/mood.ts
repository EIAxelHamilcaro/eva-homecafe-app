import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const moodEntry = pgTable(
  "mood_entry",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    moodCategory: text("mood_category").notNull(),
    moodIntensity: integer("mood_intensity").notNull(),
    moodDate: date("mood_date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("mood_entry_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    uniqueIndex("mood_entry_user_id_mood_date_uniq").on(
      table.userId,
      table.moodDate,
    ),
  ],
);
