import {
  date,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const emotionEntry = pgTable(
  "emotion_entry",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    emotionCategory: text("emotion_category").notNull(),
    emotionDate: date("emotion_date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("emotion_entry_user_id_emotion_date_idx").on(
      table.userId,
      table.emotionDate,
    ),
    uniqueIndex("emotion_entry_user_id_emotion_date_uniq").on(
      table.userId,
      table.emotionDate,
    ),
  ],
);
