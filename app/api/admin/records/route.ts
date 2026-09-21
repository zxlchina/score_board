import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/session";
import { createScoreRecords } from "@/lib/services/records";

export const runtime = "nodejs";

const createSchema = z
  .object({
    childId: z.number().int().positive(),
    kind: z.enum(["reward", "deduct"]),
    categoryId: z.number().int().positive().optional(),
    categoryIds: z.array(z.number().int().positive()).optional(),
    points: z.number().int().positive().max(9999).optional(),
    note: z.string().max(200).optional(),
  })
  .refine((v) => (v.categoryIds && v.categoryIds.length > 0) || v.categoryId, {
    message: "请选择原因",
  });

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return jsonError("未授权", auth.status);

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("参数错误", 400);

  const { childId, kind, categoryId, categoryIds, points, note } = parsed.data;
  const ids = categoryIds?.length ? categoryIds : categoryId ? [categoryId] : [];
  const created = createScoreRecords({
    childId,
    kind,
    categoryIds: ids,
    points,
    note,
  });
  if (!created.ok) return jsonError(created.error, 400);

  return jsonOk({ count: created.count }, { status: 201 });
}
