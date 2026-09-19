import { jsonOk } from "@/lib/api/response";
import { listActiveChildrenWithScores } from "@/lib/services/scores";

export const runtime = "nodejs";

export async function GET() {
  const items = listActiveChildrenWithScores();
  return jsonOk({ items });
}
