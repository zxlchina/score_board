import fs from "fs";
import { findAvatarUploadFile } from "@/lib/uploads/avatars";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ childId: string }> },
) {
  const { childId: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = findAvatarUploadFile(id);
  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  const body = fs.readFileSync(filePath);
  return new Response(body, {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
