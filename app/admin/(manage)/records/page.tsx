import { RecordForm } from "@/components/RecordForm";
import { RecordList } from "@/components/RecordList";
import { SuccessChime } from "@/components/SuccessChime";
import { getDb } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { listVisibleCategoriesForEntry } from "@/lib/services/categories";
import { listRecentRecords } from "@/lib/services/scores";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ ok?: string }> };

export default async function AdminRecordsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const db = getDb();

  const childrenList = db
    .select({
      id: children.id,
      name: children.name,
      isActive: children.isActive,
    })
    .from(children)
    .orderBy(children.sortOrder)
    .all();

  const categoriesList = listVisibleCategoriesForEntry();

  const recent = listRecentRecords(15);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="page-title mb-4">录入积分</h1>
        {sp.ok === "1" ? (
          <>
            <SuccessChime play />
            <p className="mb-4 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
              🌟 已保存，好棒！
            </p>
          </>
        ) : null}
        <RecordForm childrenList={childrenList} categoriesList={categoriesList} />
      </section>

      <section>
        <h2 className="mb-3 font-black">最近录入</h2>
        <ul className="mb-3 space-y-1 text-xs text-stone-500">
          {recent.map((r) => (
            <li key={r.id}>
              {r.childName} · {r.categoryName} · {r.points > 0 ? "+" : ""}
              {r.points}
            </li>
          ))}
        </ul>
        <RecordList items={recent} />
      </section>
    </div>
  );
}
