import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const children = sqliteTable("children", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  avatarKind: text("avatar_kind", { enum: ["builtin", "upload"] })
    .notNull()
    .default("builtin"),
  avatarValue: text("avatar_value").notNull().default("star"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: ["reward", "deduct"] }).notNull(),
  defaultPoints: integer("default_points").notNull().default(5),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
});

export const scoreRecords = sqliteTable("score_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  childId: integer("child_id")
    .notNull()
    .references(() => children.id),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  points: integer("points").notNull(),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const childrenRelations = relations(children, ({ many }) => ({
  records: many(scoreRecords),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  records: many(scoreRecords),
}));

export const scoreRecordsRelations = relations(scoreRecords, ({ one }) => ({
  child: one(children, {
    fields: [scoreRecords.childId],
    references: [children.id],
  }),
  category: one(categories, {
    fields: [scoreRecords.categoryId],
    references: [categories.id],
  }),
}));

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type CategoryType = "reward" | "deduct";
