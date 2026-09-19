import Link from "next/link";
import { RecordList } from "@/components/RecordList";
import { listAllChildrenWithScores, listRecentRecords } from "@/lib/services/scores";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  const children = listAllChildrenWithScores();
  const recent = listRecentRecords(10);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="page-title mb-4">管理概览</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/admin/records" className="card hover:-translate-y-0.5">
            <p className="text-2xl">✨</p>
            <p className="mt-1 font-black text-brand-700">录入积分</p>
            <p className="text-sm font-medium text-stone-500">奖励或扣除</p>
          </Link>
          <Link href="/admin/children" className="card hover:-translate-y-0.5">
            <p className="text-2xl">🧒</p>
            <p className="mt-1 font-black text-brand-700">小朋友</p>
            <p className="text-sm font-medium text-stone-500">{children.length} 人</p>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-black text-stone-800">全部小朋友（含停用）</h2>
        <ul className="space-y-2 text-sm">
          {children.map((c) => (
            <li key={c.id} className="flex justify-between rounded-2xl bg-white px-3 py-2.5 ring-2 ring-stone-100">
              <span>
                {c.name}
                {!c.isActive ? (
                  <span className="ml-2 text-xs text-stone-400">已停用</span>
                ) : null}
              </span>
              <span className="font-semibold tabular-nums">{c.totalScore}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-black text-stone-800">最近记录</h2>
        <RecordList items={recent} />
        <p className="mt-2 text-xs text-stone-400">
          完整明细请在各小朋友页面查看
        </p>
      </section>
    </div>
  );
}
