"use client";

import { useMemo, useState } from "react";
import { updateCategoryAction } from "@/lib/actions/admin";
import type { CategoryType } from "@/lib/db/schema";

type Filter = "all" | CategoryType;

export type CategoryAdminRow = {
  id: number;
  name: string;
  type: CategoryType;
  isActive: boolean;
  defaultPoints: number;
  usageCount: number;
};

export function CategoriesAdminList({ rows }: { rows: CategoryAdminRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.type === filter);
  }, [rows, filter]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      reward: rows.filter((r) => r.type === "reward").length,
      deduct: rows.filter((r) => r.type === "deduct").length,
    }),
    [rows],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "all" as const, label: "全部" },
            { id: "reward" as const, label: "奖励" },
            { id: "deduct" as const, label: "扣除" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`sticker-tab ${
              filter === tab.id
                ? "bg-brand-600 text-white shadow-[0_3px_0_#c2410c]"
                : "bg-white text-stone-600 ring-2 ring-stone-200 hover:bg-brand-50"
            }`}
          >
            {tab.label}
            <span className="ml-1 opacity-80">({counts[tab.id]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-stone-500">该类别下暂无分类。</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((c) => (
            <li key={c.id} className="card">
              <form action={updateCategoryAction} className="space-y-3">
                <input type="hidden" name="id" value={c.id} />
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                      c.type === "reward"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {c.type === "reward" ? "奖励" : "扣除"}
                  </span>
                  <span className="text-xs text-stone-400">已用 {c.usageCount} 次</span>
                </div>
                <div>
                  <label className="label" htmlFor={`name-${c.id}`}>
                    名称
                  </label>
                  <input
                    id={`name-${c.id}`}
                    name="name"
                    className="input w-full"
                    defaultValue={c.name}
                    required
                  />
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[5.5rem] flex-1">
                    <label className="label" htmlFor={`dp-${c.id}`}>
                      默认分
                    </label>
                    <input
                      id={`dp-${c.id}`}
                      name="defaultPoints"
                      type="number"
                      min={1}
                      max={9999}
                      className="input w-full"
                      defaultValue={c.defaultPoints}
                      required
                    />
                  </div>
                  <label className="flex h-[42px] items-center gap-2 pb-0.5 text-sm">
                    <input
                      type="checkbox"
                      name="isActive"
                      value="true"
                      defaultChecked={c.isActive}
                    />
                    可选用
                  </label>
                  <button type="submit" className="btn-secondary ml-auto w-full sm:w-auto">
                    保存
                  </button>
                </div>
              </form>
              {!c.isActive ? (
                <p className="mt-2 text-xs text-stone-400">已禁用，新录入不可选</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
