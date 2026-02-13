import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const profile = pgTable(
  "profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    phone: text("phone"),
    birthday: timestamp("birthday"),
    profession: text("profession"),
    addressStreet: text("address_street"),
    addressZipCode: text("address_zip_code"),
    addressCity: text("address_city"),
    addressCountry: text("address_country"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("profile_user_id_idx").on(table.userId)],
);
