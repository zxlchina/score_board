"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { normalizeBuiltinId } from "@/lib/avatars";
import { getDb } from "@/lib/db";
import { children } from "@/lib/db/schema";
import {
  avatarFilePath,
  deleteAvatarUploads,
  ensureAvatarsDir,
  extFromMime,
} from "@/lib/uploads/avatars";
import fs from "fs";

const MAX_BYTES = 2 * 1024 * 1024;

async function assertAdmin() {
  const session = await getSession();
  if (!session.isAdmin) {
    throw new Error("未授权");
  }
}

export async function setBuiltinAvatarAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = Number(formData.get("childId"));
  const builtinId = String(formData.get("builtinId") ?? "");
  if (!Number.isFinite(id)) return;

  const db = getDb();
  const child = db.select().from(children).where(eq(children.id, id)).get();
  if (!child) return;

  deleteAvatarUploads(id);
  db.update(children)
    .set({
      avatarKind: "builtin",
      avatarValue: normalizeBuiltinId(builtinId),
    })
    .where(eq(children.id, id))
    .run();

  revalidatePath("/");
  revalidatePath("/admin/children");
  revalidatePath(`/children/${id}`);
}

export async function uploadChildAvatarAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = Number(formData.get("childId"));
  const file = formData.get("avatar");
  if (!Number.isFinite(id) || !(file instanceof File) || file.size === 0) return;
  if (file.size > MAX_BYTES) return;

  const ext = extFromMime(file.type);
  if (!ext) return;

  const db = getDb();
  const child = db.select().from(children).where(eq(children.id, id)).get();
  if (!child) return;

  ensureAvatarsDir();
  deleteAvatarUploads(id);
  const buf = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(avatarFilePath(id, ext), buf);

  db.update(children)
    .set({ avatarKind: "upload", avatarValue: "upload" })
    .where(eq(children.id, id))
    .run();

  revalidatePath("/");
  revalidatePath("/admin/children");
  revalidatePath(`/children/${id}`);
}
