import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { categories, children, scoreRecords, type CategoryType } from "@/lib/db/schema";

export type CreateRecordsInput = {
  childId: number;
  kind: CategoryType;
  categoryIds: number[];
  points?: number;
  note?: string | null;
};

export type CreateRecordsResult =
  | { ok: true; count: number }
  | { ok: false; error: string };

export function createScoreRecords(input: CreateRecordsInput): CreateRecordsResult {
  const ids = [...new Set(input.categoryIds.filter((id) => Number.isInteger(id) && id > 0))];
  if (ids.length === 0) return { ok: false, error: "请选择原因" };

  const db = getDb();
  const child = db.select().from(children).where(eq(children.id, input.childId)).get();
  if (!child) return { ok: false, error: "小朋友不存在" };

  const rows = db.select().from(categories).where(inArray(categories.id, ids)).all();
  const byId = new Map(rows.map((c) => [c.id, c]));

  for (const id of ids) {
    const category = byId.get(id);
    if (!category || !category.isActive || category.deletedAt) {
      return { ok: false, error: "分类无效" };
    }
    if (category.type !== input.kind) {
      return { ok: false, error: "分类与类型不一致" };
    }
  }

  const note = input.note?.trim() || null;
  const useDefaults = ids.length > 1;

  db.transaction((tx) => {
    for (const id of ids) {
      const category = byId.get(id)!;
      const rawPoints = useDefaults
        ? category.defaultPoints
        : (input.points ?? category.defaultPoints);
      const signedPoints = input.kind === "reward" ? rawPoints : -rawPoints;
      tx.insert(scoreRecords)
        .values({
          childId: input.childId,
          categoryId: id,
          points: signedPoints,
          note,
        })
        .run();
    }
  });

  return { ok: true, count: ids.length };
}
