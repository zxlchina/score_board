"use client";

import { useEffect, useMemo, useState } from "react";
import { createRecordAction } from "@/lib/actions/admin";
import { playSfx } from "@/lib/sound";

type Child = { id: number; name: string; isActive: boolean };
type Category = {
  id: number;
  name: string;
  type: "reward" | "deduct";
  isActive: boolean;
  defaultPoints: number;
};

export function RecordForm({
  childrenList,
  categoriesList,
}: {
  childrenList: Child[];
  categoriesList: Category[];
}) {
  const activeChildren = childrenList.filter((c) => c.isActive);
  const [kind, setKind] = useState<"reward" | "deduct">("reward");
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [points, setPoints] = useState(5);
  const [moreOpen, setMoreOpen] = useState(false);

  const filteredCategories = useMemo(
    () => categoriesList.filter((c) => c.isActive && c.type === kind),
    [categoriesList, kind],
  );

  const selectedCategories = useMemo(
    () =>
      categoryIds
        .map((id) => filteredCategories.find((c) => c.id === id))
        .filter((c): c is Category => Boolean(c)),
    [filteredCategories, categoryIds],
  );

  const singleCategory = selectedCategories.length === 1 ? selectedCategories[0] : undefined;
  const multi = selectedCategories.length > 1;

  useEffect(() => {
    setCategoryIds([]);
  }, [kind]);

  useEffect(() => {
    if (singleCategory) setPoints(singleCategory.defaultPoints);
  }, [singleCategory]);

  function toggleCategory(id: number) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    playSfx(kind === "reward" ? "select" : "deduct");
  }

  function resetToDefault() {
    if (singleCategory) setPoints(singleCategory.defaultPoints);
  }

  const defaultPoints = singleCategory?.defaultPoints ?? 5;
  const pointsDirty = singleCategory ? points !== singleCategory.defaultPoints : false;
  const sign = kind === "reward" ? "+" : "-";
  const selectedSum = selectedCategories.reduce((n, c) => n + c.defaultPoints, 0);
  const displayPoints = multi ? selectedSum : points;

  const moreHint = multi
    ? `合计 ${sign}${selectedSum}，共 ${selectedCategories.length} 条`
    : singleCategory
      ? pointsDirty
        ? `本次 ${points} 分（非默认）`
        : `按默认 ${sign}${defaultPoints} 分`
      : "先选择原因";

  return (
    <form action={createRecordAction} className="card space-y-4">
      <div>
        <label className="label">小朋友</label>
        <select name="childId" className="input" required defaultValue="">
          <option value="" disabled>
            请选择
          </option>
          {activeChildren.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="label">类型</span>
        <div className="flex gap-2">
          {(["reward", "deduct"] as const).map((k) => (
            <label
              key={k}
              className={`flex-1 cursor-pointer rounded-2xl border-2 px-3 py-2.5 text-center text-sm font-bold ${
                kind === k
                  ? k === "reward"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-rose-300 bg-rose-50 text-rose-800"
                  : "border-stone-200 bg-white"
              }`}
            >
              <input
                type="radio"
                name="kind"
                value={k}
                className="sr-only"
                checked={kind === k}
                onChange={() => setKind(k)}
              />
              {k === "reward" ? "🌟 奖励" : "🌧️ 扣除"}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="label">原因（可多选，再点取消）</span>
        {categoryIds.map((id) => (
          <input key={id} type="hidden" name="categoryId" value={id} />
        ))}
        {filteredCategories.length === 0 ? (
          <p className="text-sm text-stone-500">暂无可用分类，请先在「分类」里添加。</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredCategories.map((c) => {
              const selected = categoryIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(c.id)}
                  className={`rounded-2xl border-2 px-3 py-2.5 text-left text-sm transition ${
                    selected
                      ? kind === "reward"
                        ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200"
                        : "border-rose-400 bg-rose-50 ring-2 ring-rose-200"
                      : "border-stone-200 bg-white hover:border-brand-300"
                  }`}
                >
                  <span className="block break-words font-bold leading-snug text-stone-800">
                    {c.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    默认 {sign}
                    {c.defaultPoints}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!moreOpen && !multi && singleCategory ? (
        <input type="hidden" name="points" value={points} />
      ) : null}

      <div className="rounded-2xl border-2 border-stone-200 bg-white">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm"
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
        >
          <span className="font-bold text-stone-700">修改分值 / 备注</span>
          <span className="flex items-center gap-2 text-xs text-stone-500">
            <span className="max-w-[10rem] truncate sm:max-w-none">{moreHint}</span>
            <span aria-hidden className="text-stone-400">
              {moreOpen ? "▲" : "▼"}
            </span>
          </span>
        </button>

        {moreOpen ? (
          <div className="space-y-3 border-t border-stone-200 px-3 pb-3 pt-3">
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <label className="label mb-0" htmlFor="record-points">
                  本次分值
                </label>
                {multi ? (
                  <span className="text-xs text-stone-500">
                    {selectedCategories.length} 项合计，不可改
                  </span>
                ) : pointsDirty ? (
                  <button
                    type="button"
                    className="text-xs text-brand-700 hover:underline"
                    onClick={resetToDefault}
                  >
                    恢复默认 ({defaultPoints})
                  </button>
                ) : null}
              </div>
              <input
                id="record-points"
                name={multi ? undefined : "points"}
                type="number"
                min={1}
                max={9999}
                className="input disabled:bg-stone-50 disabled:text-stone-600"
                required={!multi}
                value={selectedCategories.length === 0 ? "" : displayPoints}
                onChange={(e) => setPoints(Number(e.target.value))}
                disabled={multi || !singleCategory}
                readOnly={multi}
              />
              {multi ? (
                <p className="mt-1 text-xs text-stone-500">
                  将按各原因默认分各记一条，合计 {sign}
                  {selectedSum} 分。
                </p>
              ) : null}
            </div>

            <div>
              <label className="label">备注（可选）</label>
              <textarea name="note" className="input min-h-[72px]" maxLength={200} />
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={categoryIds.length === 0 || filteredCategories.length === 0}
      >
        {categoryIds.length > 1 ? `提交 ${categoryIds.length} 条` : "提交"}
      </button>
    </form>
  );
}
