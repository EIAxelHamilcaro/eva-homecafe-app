import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const friendRequest = pgTable(
  "friend_request",
  {
    id: text("id").primaryKey(),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    respondedAt: timestamp("responded_at"),
  },
  (table) => [
    index("friend_request_sender_id_idx").on(table.senderId),
    index("friend_request_receiver_id_idx").on(table.receiverId),
    uniqueIndex("friend_request_pair_idx").on(table.senderId, table.receiverId),
  ],
);

export const inviteToken = pgTable(
  "invite_token",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("invite_token_token_idx").on(table.token),
    index("invite_token_user_id_idx").on(table.userId),
  ],
);
