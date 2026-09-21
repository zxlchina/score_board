import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { categories, scoreRecords, type CategoryType } from "@/lib/db/schema";

export const notDeleted = isNull(categories.deletedAt);

export type CategoryAdminRow = {
  id: number;
  name: string;
  type: CategoryType;
  isActive: boolean;
  defaultPoints: number;
  usageCount: number;
};

export function listVisibleCategoriesWithUsage(): CategoryAdminRow[] {
  const db = getDb();
  return db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      sortOrder: categories.sortOrder,
      isActive: categories.isActive,
      defaultPoints: categories.defaultPoints,
      usageCount: sql<number>`count(${scoreRecords.id})`.as("usage_count"),
    })
    .from(categories)
    .leftJoin(scoreRecords, eq(scoreRecords.categoryId, categories.id))
    .where(notDeleted)
    .groupBy(categories.id)
    .orderBy(categories.type, categories.sortOrder, categories.id)
    .all()
    .map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      isActive: r.isActive,
      defaultPoints: r.defaultPoints,
      usageCount: Number(r.usageCount),
    }));
}

export function listVisibleCategoriesForEntry() {
  const db = getDb();
  return db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      isActive: categories.isActive,
      defaultPoints: categories.defaultPoints,
    })
    .from(categories)
    .where(notDeleted)
    .orderBy(categories.type, categories.sortOrder)
    .all();
}

export function softDeleteCategory(id: number): boolean {
  const row = getDb()
    .update(categories)
    .set({ deletedAt: new Date() })
    .where(and(eq(categories.id, id), notDeleted))
    .returning({ id: categories.id })
    .get();
  return Boolean(row);
}
