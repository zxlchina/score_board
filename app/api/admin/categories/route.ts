import { eq } from "drizzle-orm";
import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { categories } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return jsonError("未授权", auth.status);

  const db = getDb();
  const items = db
    .select()
    .from(categories)
    .orderBy(categories.type, categories.sortOrder)
    .all();
  return jsonOk({ items });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(32),
  type: z.enum(["reward", "deduct"]),
  sortOrder: z.number().int().optional(),
  defaultPoints: z.number().int().min(1).max(9999).optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return jsonError("未授权", auth.status);

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("参数错误", 400);

  const db = getDb();
  let sortOrder = parsed.data.sortOrder;
  if (sortOrder === undefined) {
    const all = db.select().from(categories).all();
    sortOrder =
      all.length === 0 ? 0 : Math.max(...all.map((c) => c.sortOrder)) + 1;
  }

  const item = db
    .insert(categories)
    .values({
      name: parsed.data.name,
      type: parsed.data.type,
      sortOrder,
      defaultPoints: parsed.data.defaultPoints ?? 5,
    })
    .returning()
    .get();

  return jsonOk({ item }, { status: 201 });
}

const patchSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(32).optional(),
  isActive: z.boolean().optional(),
  defaultPoints: z.number().int().min(1).max(9999).optional(),
});

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return jsonError("未授权", auth.status);

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("参数错误", 400);

  const { id, ...patch } = parsed.data;
  if (Object.keys(patch).length === 0) return jsonError("无更新内容", 400);

  const item = getDb()
    .update(categories)
    .set(patch)
    .where(eq(categories.id, id))
    .returning()
    .get();

  if (!item) return jsonError("未找到", 404);
  return jsonOk({ item });
}
