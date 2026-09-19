import { jsonError, jsonOk } from "@/lib/api/response";
import {
  getActiveChild,
  getTotalScoreForChild,
} from "@/lib/services/scores";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return jsonError("无效 ID", 400);

  const child = getActiveChild(id);
  if (!child) return jsonError("未找到", 404);

  return jsonOk({
    id: child.id,
    name: child.name,
    sortOrder: child.sortOrder,
    totalScore: getTotalScoreForChild(id),
  });
}
