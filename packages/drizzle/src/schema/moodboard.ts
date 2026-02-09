import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const moodboard = pgTable(
  "moodboard",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("moodboard_user_id_idx").on(table.userId)],
);

export const pin = pgTable(
  "pin",
  {
    id: text("id").primaryKey(),
    moodboardId: text("moodboard_id")
      .notNull()
      .references(() => moodboard.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    imageUrl: text("image_url"),
    color: text("color"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("pin_moodboard_id_idx").on(table.moodboardId)],
);
