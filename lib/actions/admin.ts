"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getAdminPassword, getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { categories, children } from "@/lib/db/schema";
import { notDeleted, softDeleteCategory } from "@/lib/services/categories";
import { createScoreRecords } from "@/lib/services/records";

async function assertAdmin() {
  const session = await getSession();
  if (!session.isAdmin) {
    throw new Error("未授权");
  }
}

export async function loginAction(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (password !== getAdminPassword()) {
    redirect("/admin/login?error=1");
  }
  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  redirect("/admin");
}

export async function createChildAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const db = getDb();
  const maxSort = db.select().from(children).all();
  const sortOrder =
    maxSort.length === 0
      ? 0
      : Math.max(...maxSort.map((c) => c.sortOrder)) + 1;

  db.insert(children).values({ name, sortOrder }).run();
  revalidatePath("/");
  revalidatePath("/admin/children");
}

export async function updateChildAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const sortOrderRaw = formData.get("sortOrder");
  const isActiveRaw = formData.get("isActive");

  if (!Number.isFinite(id)) return;

  const patch: Partial<{
    name: string;
    sortOrder: number;
    isActive: boolean;
  }> = {};

  if (name) patch.name = name;
  if (sortOrderRaw !== null && sortOrderRaw !== "") {
    patch.sortOrder = Number(sortOrderRaw);
  }
  if (isActiveRaw === "true") patch.isActive = true;
  if (isActiveRaw === "false") patch.isActive = false;

  if (Object.keys(patch).length === 0) return;

  getDb().update(children).set(patch).where(eq(children.id, id)).run();
  revalidatePath("/");
  revalidatePath("/admin/children");
  revalidatePath(`/children/${id}`);
}

const recordSchema = z.object({
  childId: z.coerce.number().int().positive(),
  kind: z.enum(["reward", "deduct"]),
  categoryIds: z.array(z.coerce.number().int().positive()).min(1),
  points: z.coerce.number().int().positive().max(9999).optional(),
  note: z.string().max(200).optional(),
});

export async function createRecordAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const categoryIds = formData.getAll("categoryId");
  const pointsRaw = formData.get("points");
  const parsed = recordSchema.safeParse({
    childId: formData.get("childId"),
    kind: formData.get("kind"),
    categoryIds,
    points: pointsRaw === null || pointsRaw === "" ? undefined : pointsRaw,
    note: String(formData.get("note") ?? "").trim() || undefined,
  });

  if (!parsed.success) return;

  const { childId, kind, points, note } = parsed.data;
  const created = createScoreRecords({
    childId,
    kind,
    categoryIds: parsed.data.categoryIds,
    points,
    note,
  });
  if (!created.ok) return;

  revalidatePath("/");
  revalidatePath("/admin/records");
  revalidatePath(`/children/${childId}`);
  redirect(`/admin/records?ok=1`);
}

function parseDefaultPoints(raw: FormDataEntryValue | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > 9999) return 5;
  return Math.floor(n);
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const type = formData.get("type");
  if (!name || (type !== "reward" && type !== "deduct")) return;

  const defaultPoints = parseDefaultPoints(formData.get("defaultPoints"));

  const db = getDb();
  const existing = db.select().from(categories).all();
  const sortOrder =
    existing.length === 0
      ? 0
      : Math.max(...existing.map((c) => c.sortOrder)) + 1;

  db.insert(categories)
    .values({ name, type, sortOrder, defaultPoints })
    .run();
  revalidatePath("/admin/categories");
  revalidatePath("/admin/records");
}

export async function updateCategoryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const isActive = formData.get("isActive");

  if (!Number.isFinite(id)) return;

  const defaultPointsRaw = formData.get("defaultPoints");

  const patch: Partial<{
    name: string;
    isActive: boolean;
    defaultPoints: number;
  }> = {};
  if (name) patch.name = name;
  patch.isActive = isActive === "true";
  if (defaultPointsRaw !== null && defaultPointsRaw !== "") {
    patch.defaultPoints = parseDefaultPoints(defaultPointsRaw);
  }

  getDb()
    .update(categories)
    .set(patch)
    .where(and(eq(categories.id, id), notDeleted))
    .run();
  revalidatePath("/admin/categories");
  revalidatePath("/admin/records");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  softDeleteCategory(id);
  revalidatePath("/", "layout");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/records");
}
