import { formatDateTime, formatPoints } from "@/lib/format";
import type { RecordRow } from "@/lib/services/scores";

export type RecordListItem = RecordRow & { childName?: string };

export function RecordList({ items }: { items: RecordListItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-stone-500">暂无积分记录</p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((r) => {
        const reward = r.categoryType === "reward";
        return (
          <li key={r.id} className="card flex gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${
                reward ? "bg-emerald-100" : "bg-rose-100"
              }`}
            >
              {reward ? "🌟" : "🌧️"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-stone-800">
                  {r.childName ? (
                    <span className="text-stone-500">{r.childName} · </span>
                  ) : null}
                  {r.categoryName}
                </p>
                <span
                  className={`shrink-0 font-semibold tabular-nums ${
                    r.points > 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatPoints(r.points)}
                </span>
              </div>
              {r.note ? (
                <p className="mt-1 text-sm text-stone-600">{r.note}</p>
              ) : null}
              <p className="mt-1 text-xs text-stone-400">
                {formatDateTime(r.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
