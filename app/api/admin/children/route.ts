import { eq } from "drizzle-orm";
import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { listAllChildrenWithScores } from "@/lib/services/scores";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return jsonError("未授权", auth.status);

  return jsonOk({ items: listAllChildrenWithScores() });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(32),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return jsonError("未授权", auth.status);

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("参数错误", 400);

  const db = getDb();
  let sortOrder = parsed.data.sortOrder;
  if (sortOrder === undefined) {
    const all = db.select().from(children).all();
    sortOrder =
      all.length === 0 ? 0 : Math.max(...all.map((c) => c.sortOrder)) + 1;
  }

  const inserted = db
    .insert(children)
    .values({ name: parsed.data.name, sortOrder })
    .returning()
    .get();

  return jsonOk({ item: inserted }, { status: 201 });
}

const patchSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(32).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return jsonError("未授权", auth.status);

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("参数错误", 400);

  const { id, ...patch } = parsed.data;
  if (Object.keys(patch).length === 0) return jsonError("无更新内容", 400);

  const db = getDb();
  const updated = db
    .update(children)
    .set(patch)
    .where(eq(children.id, id))
    .returning()
    .get();

  if (!updated) return jsonError("未找到", 404);
  return jsonOk({ item: updated });
}
