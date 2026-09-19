import fs from "fs";
import path from "path";
import { getDatabasePath } from "@/lib/db/path";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export function getAvatarsUploadDir(): string {
  const dbPath = getDatabasePath();
  return path.join(path.dirname(dbPath), "uploads", "avatars");
}

export function ensureAvatarsDir(): void {
  fs.mkdirSync(getAvatarsUploadDir(), { recursive: true });
}

export function avatarFilePath(childId: number, ext: string): string {
  const safeExt = ALLOWED_EXT.has(ext.toLowerCase()) ? ext.toLowerCase() : ".jpg";
  return path.join(getAvatarsUploadDir(), `${childId}${safeExt}`);
}

export function findAvatarUploadFile(childId: number): string | null {
  const dir = getAvatarsUploadDir();
  if (!fs.existsSync(dir)) return null;
  for (const ext of ALLOWED_EXT) {
    const p = path.join(dir, `${childId}${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function deleteAvatarUploads(childId: number): void {
  const dir = getAvatarsUploadDir();
  if (!fs.existsSync(dir)) return;
  for (const ext of ALLOWED_EXT) {
    const p = path.join(dir, `${childId}${ext}`);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

export function extFromMime(mime: string): string | null {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return null;
}
