import { getSessionFromRequest } from "@/lib/auth/session";
import { getBasePath } from "@/lib/base-path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const base = getBasePath();
  const res = NextResponse.redirect(new URL(`${base}/`, req.url));
  const session = await getSessionFromRequest(req, res);
  session.destroy();
  return res;
}
