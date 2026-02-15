import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const chronologie = pgTable(
  "chronologie",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("chronologie_user_id_idx").on(table.userId)],
);

export const chronologieEntry = pgTable(
  "chronologie_entry",
  {
    id: text("id").primaryKey(),
    chronologieId: text("chronologie_id")
      .notNull()
      .references(() => chronologie.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    startDate: date("start_date", { mode: "string" }),
    endDate: date("end_date", { mode: "string" }),
    color: integer("color").notNull().default(0),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("chronologie_entry_chronologie_id_position_idx").on(
      table.chronologieId,
      table.position,
    ),
  ],
);
