import path from "path";

export function getDatabasePath(): string {
  const raw = process.env.DATABASE_PATH ?? "./data/score.db";
  if (raw.startsWith("file:")) {
    return raw.slice("file:".length);
  }
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
}
