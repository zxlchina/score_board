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
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [points, setPoints] = useState(5);
  const [moreOpen, setMoreOpen] = useState(false);

  const filteredCategories = useMemo(
    () => categoriesList.filter((c) => c.isActive && c.type === kind),
    [categoriesList, kind],
  );

  const selectedCategory = useMemo(
    () => filteredCategories.find((c) => c.id === categoryId),
    [filteredCategories, categoryId],
  );

  useEffect(() => {
    setCategoryId("");
  }, [kind]);

  useEffect(() => {
    if (selectedCategory) {
      setPoints(selectedCategory.defaultPoints);
    }
  }, [selectedCategory]);

  function selectCategory(id: number) {
    setCategoryId(id);
    const cat = filteredCategories.find((c) => c.id === id);
    if (cat) setPoints(cat.defaultPoints);
    playSfx(kind === "reward" ? "select" : "deduct");
  }

  function resetToDefault() {
    if (selectedCategory) setPoints(selectedCategory.defaultPoints);
  }

  const defaultPoints = selectedCategory?.defaultPoints ?? 5;
  const pointsDirty = selectedCategory ? points !== selectedCategory.defaultPoints : false;

  const moreHint = selectedCategory
    ? pointsDirty
      ? `本次 ${points} 分（非默认）`
      : `按默认 ${kind === "reward" ? "+" : "-"}${defaultPoints} 分`
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
        <span className="label">原因（点选即可）</span>
        <input type="hidden" name="categoryId" value={categoryId === "" ? "" : categoryId} />
        {filteredCategories.length === 0 ? (
          <p className="text-sm text-stone-500">暂无可用分类，请先在「分类」里添加。</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredCategories.map((c) => {
              const selected = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCategory(c.id)}
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
                    默认 {kind === "reward" ? "+" : "-"}
                    {c.defaultPoints}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!moreOpen ? <input type="hidden" name="points" value={points} /> : null}

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
                {pointsDirty ? (
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
                name="points"
                type="number"
                min={1}
                max={9999}
                className="input"
                required
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                disabled={!selectedCategory}
              />
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
        disabled={!categoryId || filteredCategories.length === 0}
      >
        提交
      </button>
    </form>
  );
}
