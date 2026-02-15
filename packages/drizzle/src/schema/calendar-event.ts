import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const calendarEvent = pgTable("calendar_event", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  color: text("color").notNull(),
  date: text("date").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});
