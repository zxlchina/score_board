import { and, desc, eq, gte, sql, sum } from "drizzle-orm";
import type { AvatarKind } from "@/lib/avatars";
import { getDb } from "@/lib/db";
import { categories, children, scoreRecords, type CategoryType } from "@/lib/db/schema";
import { sinceForPeriod, type RankPeriod } from "@/lib/ranking";

export function getTotalScoreForChild(
  childId: number,
  since?: Date | null,
): number {
  const db = getDb();
  const where =
    since != null
      ? and(eq(scoreRecords.childId, childId), gte(scoreRecords.createdAt, since))
      : eq(scoreRecords.childId, childId);
  const [row] = db
    .select({ total: sum(scoreRecords.points) })
    .from(scoreRecords)
    .where(where)
    .all();
  return Number(row?.total ?? 0);
}

export type ChildWithScore = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  avatarKind: AvatarKind;
  avatarValue: string;
  totalScore: number;
};

function mapChildRow(
  c: typeof children.$inferSelect,
  since: Date | null,
): ChildWithScore {
  return {
    id: c.id,
    name: c.name,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    avatarKind: c.avatarKind,
    avatarValue: c.avatarValue,
    totalScore: getTotalScoreForChild(c.id, since),
  };
}

export function listActiveChildrenWithScores(): ChildWithScore[] {
  const db = getDb();
  const rows = db
    .select()
    .from(children)
    .where(eq(children.isActive, true))
    .orderBy(children.sortOrder, children.id)
    .all();

  return rows.map((c) => mapChildRow(c, null));
}

/** 按积分降序，同分按 sortOrder / id */
export function listActiveChildrenRanked(
  period: RankPeriod = "all",
): ChildWithScore[] {
  const since = sinceForPeriod(period);
  const db = getDb();
  const rows = db
    .select()
    .from(children)
    .where(eq(children.isActive, true))
    .orderBy(children.sortOrder, children.id)
    .all();
  const list = rows.map((c) => mapChildRow(c, since));
  return [...list].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id - b.id;
  });
}

export function listAllChildrenWithScores(): ChildWithScore[] {
  const db = getDb();
  const rows = db
    .select()
    .from(children)
    .orderBy(children.sortOrder, children.id)
    .all();

  return rows.map((c) => mapChildRow(c, null));
}

export function getActiveChild(id: number) {
  const db = getDb();
  return db
    .select()
    .from(children)
    .where(and(eq(children.id, id), eq(children.isActive, true)))
    .get();
}

export function getChildById(id: number) {
  const db = getDb();
  return db.select().from(children).where(eq(children.id, id)).get();
}

export type RecordRow = {
  id: number;
  points: number;
  note: string | null;
  createdAt: Date;
  categoryName: string;
  categoryType: CategoryType;
};

export function listRecordsForChild(
  childId: number,
  opts: { type?: CategoryType; page: number; limit: number },
): { items: RecordRow[]; total: number } {
  const db = getDb();
  const { type, page, limit } = opts;
  const offset = (page - 1) * limit;

  const typeFilter = type
    ? eq(categories.type, type)
    : undefined;

  const baseWhere = typeFilter
    ? and(eq(scoreRecords.childId, childId), typeFilter)
    : eq(scoreRecords.childId, childId);

  const [{ value: total }] = db
    .select({ value: sql<number>`count(*)` })
    .from(scoreRecords)
    .innerJoin(categories, eq(scoreRecords.categoryId, categories.id))
    .where(baseWhere)
    .all();

  const items = db
    .select({
      id: scoreRecords.id,
      points: scoreRecords.points,
      note: scoreRecords.note,
      createdAt: scoreRecords.createdAt,
      categoryName: categories.name,
      categoryType: categories.type,
    })
    .from(scoreRecords)
    .innerJoin(categories, eq(scoreRecords.categoryId, categories.id))
    .where(baseWhere)
    .orderBy(desc(scoreRecords.createdAt), desc(scoreRecords.id))
    .limit(limit)
    .offset(offset)
    .all();

  return { items, total: Number(total) };
}

export function listRecentRecords(limit = 20): (RecordRow & { childName: string })[] {
  const db = getDb();
  return db
    .select({
      id: scoreRecords.id,
      points: scoreRecords.points,
      note: scoreRecords.note,
      createdAt: scoreRecords.createdAt,
      categoryName: categories.name,
      categoryType: categories.type,
      childName: children.name,
    })
    .from(scoreRecords)
    .innerJoin(categories, eq(scoreRecords.categoryId, categories.id))
    .innerJoin(children, eq(scoreRecords.childId, children.id))
    .orderBy(desc(scoreRecords.createdAt), desc(scoreRecords.id))
    .limit(limit)
    .all();
}
