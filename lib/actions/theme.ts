"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { saveThemeConfig } from "@/lib/services/settings";
import { isValidHexColor, normalizeTheme, type ThemeConfig } from "@/lib/theme";

async function assertAdmin() {
  const session = await getSession();
  if (!session.isAdmin) {
    throw new Error("未授权");
  }
}

export async function saveThemeAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const primary = String(formData.get("primary") ?? "").trim();
  const background = String(formData.get("background") ?? "").trim();

  if (!isValidHexColor(primary) || !isValidHexColor(background)) {
    redirect("/admin/theme?error=1");
  }

  const theme: ThemeConfig = normalizeTheme({ primary, background });
  saveThemeConfig(theme);
  revalidatePath("/");
  revalidatePath("/admin/theme");
  redirect("/admin/theme?ok=1");
}

export async function applyPresetAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const primary = String(formData.get("primary") ?? "").trim();
  const background = String(formData.get("background") ?? "").trim();

  if (!isValidHexColor(primary) || !isValidHexColor(background)) return;

  saveThemeConfig(normalizeTheme({ primary, background }));
  revalidatePath("/");
  revalidatePath("/admin/theme");
  redirect("/admin/theme?ok=1");
}
