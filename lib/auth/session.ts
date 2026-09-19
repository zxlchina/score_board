import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getBasePath } from "@/lib/base-path";

export type SessionData = {
  isAdmin?: boolean;
};

const cookiePath = getBasePath() || "/";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "dev-only-insecure-session-secret!!",
  cookieName: "score_board_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: cookiePath,
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function getSessionFromRequest(req: NextRequest, res: NextResponse) {
  return getIronSession<SessionData>(req, res, sessionOptions);
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "admin";
}

export async function requireAdmin(): Promise<
  { ok: true } | { ok: false; status: 401 }
> {
  const session = await getSession();
  if (!session.isAdmin) {
    return { ok: false, status: 401 };
  }
  return { ok: true };
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session.isAdmin);
}
