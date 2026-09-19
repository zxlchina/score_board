import { eq } from "drizzle-orm";
import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { categories, children, scoreRecords } from "@/lib/db/schema";

export const runtime = "nodejs";

const createSchema = z.object({
  childId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  kind: z.enum(["reward", "deduct"]),
  points: z.number().int().positive().max(9999),
  note: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return jsonError("未授权", auth.status);

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("参数错误", 400);

  const { childId, categoryId, kind, points, note } = parsed.data;
  const db = getDb();

  const child = db.select().from(children).where(eq(children.id, childId)).get();
  if (!child) return jsonError("小朋友不存在", 400);

  const category = db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .get();
  if (!category || !category.isActive) return jsonError("分类无效", 400);
  if (category.type !== kind) return jsonError("分类与类型不一致", 400);

  const signedPoints = kind === "reward" ? points : -points;
  const item = db
    .insert(scoreRecords)
    .values({
      childId,
      categoryId,
      points: signedPoints,
      note: note ?? null,
    })
    .returning()
    .get();

  return jsonOk({ item }, { status: 201 });
}
