import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const photo = pgTable(
  "photo",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    caption: text("caption"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("photo_user_id_created_at_idx").on(table.userId, table.createdAt),
  ],
);
