import { eq, sql } from "drizzle-orm";
import { CategoriesAdminList } from "@/components/CategoriesAdminList";
import { createCategoryAction } from "@/lib/actions/admin";
import { getDb } from "@/lib/db";
import { categories, scoreRecords } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

function listCategoriesWithUsage() {
  const db = getDb();
  return db
    .select({
      id: categories.id,
      name: categories.name,
      type: categories.type,
      sortOrder: categories.sortOrder,
      isActive: categories.isActive,
      defaultPoints: categories.defaultPoints,
      usageCount: sql<number>`count(${scoreRecords.id})`.as("usage_count"),
    })
    .from(categories)
    .leftJoin(scoreRecords, eq(scoreRecords.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.type, categories.sortOrder, categories.id)
    .all()
    .map((r) => ({ ...r, usageCount: Number(r.usageCount) }));
}

export default function AdminCategoriesPage() {
  const rows = listCategoriesWithUsage();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="page-title mb-4">原因分类</h1>
        <form action={createCategoryAction} className="card space-y-3">
          <div>
            <label className="label" htmlFor="cat-name">
              名称
            </label>
            <input id="cat-name" name="name" className="input w-full" required maxLength={32} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="cat-type">
                类型
              </label>
              <select id="cat-type" name="type" className="input w-full" required>
                <option value="reward">奖励</option>
                <option value="deduct">扣除</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="cat-default-points">
                默认分值
              </label>
              <input
                id="cat-default-points"
                name="defaultPoints"
                type="number"
                min={1}
                max={9999}
                className="input w-full"
                defaultValue={5}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            添加分类
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-black text-stone-700">已有分类</h2>
        <CategoriesAdminList rows={rows} />
      </section>
    </div>
  );
}
