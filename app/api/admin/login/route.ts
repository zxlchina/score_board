import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/response";
import {
  getAdminPassword,
  getSessionFromRequest,
} from "@/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const bodySchema = z.object({ password: z.string().min(1) });

export async function POST(req: NextRequest) {
  const res = new NextResponse();
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return jsonError("参数错误", 400);

  if (parsed.data.password !== getAdminPassword()) {
    return jsonError("口令错误", 401);
  }

  const session = await getSessionFromRequest(req, res);
  session.isAdmin = true;
  await session.save();
  return jsonOk({ ok: true }, { headers: res.headers });
}
