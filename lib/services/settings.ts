import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import {
  DEFAULT_THEME,
  normalizeTheme,
  type ThemeConfig,
} from "@/lib/theme";

const THEME_KEY = "theme";

function readThemeJson(): ThemeConfig {
  const db = getDb();
  const row = db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, THEME_KEY))
    .get();
  if (!row?.value) return { ...DEFAULT_THEME };
  try {
    return normalizeTheme(JSON.parse(row.value));
  } catch {
    return { ...DEFAULT_THEME };
  }
}

export function getThemeConfig(): ThemeConfig {
  return readThemeJson();
}

export function saveThemeConfig(theme: ThemeConfig): void {
  const db = getDb();
  const value = JSON.stringify(normalizeTheme(theme));
  db.insert(siteSettings)
    .values({ key: THEME_KEY, value })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value },
    })
    .run();
}
