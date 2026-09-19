import type { CategoryType } from "@/lib/db/schema";
import { jsonError, jsonOk } from "@/lib/api/response";
import { getActiveChild, listRecordsForChild } from "@/lib/services/scores";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return jsonError("无效 ID", 400);

  const child = getActiveChild(id);
  if (!child) return jsonError("未找到", 404);

  const url = new URL(req.url);
  const typeParam = url.searchParams.get("type");
  const type =
    typeParam === "reward" || typeParam === "deduct"
      ? (typeParam as CategoryType)
      : undefined;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));

  const result = listRecordsForChild(id, { type, page, limit });
  return jsonOk({
    page,
    limit,
    total: result.total,
    items: result.items.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
