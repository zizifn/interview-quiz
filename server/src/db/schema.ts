import { InferSelectModel } from "drizzle-orm";
import { boolean } from "drizzle-orm/gel-core";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  username: text().notNull().unique(),
  password_hash: text().notNull(),
  is_employee: integer({ mode: "boolean" }).default(false),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at", {
    mode: "timestamp",
  }).notNull(),
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
