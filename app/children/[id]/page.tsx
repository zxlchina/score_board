import Link from "next/link";
import { notFound } from "next/navigation";
import { ChildAvatar } from "@/components/ChildAvatar";
import { RecordList } from "@/components/RecordList";
import { ScoreBadge } from "@/components/ScoreBadge";
import type { CategoryType } from "@/lib/db/schema";
import {
  getActiveChild,
  getTotalScoreForChild,
  listRecordsForChild,
} from "@/lib/services/scores";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; page?: string }>;
};

function parseType(raw?: string): CategoryType | undefined {
  if (raw === "reward" || raw === "deduct") return raw;
  return undefined;
}

export default async function ChildDetailPage({ params, searchParams }: Props) {
  const { id: idStr } = await params;
  const sp = await searchParams;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const child = getActiveChild(id);
  if (!child) notFound();

  const type = parseType(sp.type);
  const page = Math.max(1, Number(sp.page) || 1);
  const totalScore = getTotalScoreForChild(id);
  const { items, total } = listRecordsForChild(id, {
    type,
    page,
    limit: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const base = `/children/${id}`;
  const tab = (t?: CategoryType) => {
    if (!t) return base;
    return `${base}?type=${t}`;
  };

  return (
    <div>
      <Link href="/" className="text-sm font-bold text-brand-600 hover:underline">
        ← 返回排行榜
      </Link>
      <div className="card mt-4 flex items-center gap-3">
        <ChildAvatar
          childId={child.id}
          avatarKind={child.avatarKind}
          avatarValue={child.avatarValue}
          size="lg"
        />
        <h1 className="min-w-0 flex-1 text-xl font-black">{child.name}</h1>
        <ScoreBadge score={totalScore} />
      </div>

      <div className="mt-6 flex gap-2 text-sm">
        <FilterTab href={tab()} active={!type} label="全部" />
        <FilterTab href={tab("reward")} active={type === "reward"} label="奖励" />
        <FilterTab href={tab("deduct")} active={type === "deduct"} label="扣除" />
      </div>

      <div className="mt-4">
        <RecordList items={items} />
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-stone-500">
            第 {page} / {totalPages} 页
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                className="btn-secondary"
                href={`${base}?${new URLSearchParams({
                  ...(type ? { type } : {}),
                  page: String(page - 1),
                }).toString()}`}
              >
                上一页
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                className="btn-secondary"
                href={`${base}?${new URLSearchParams({
                  ...(type ? { type } : {}),
                  page: String(page + 1),
                }).toString()}`}
              >
                下一页
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterTab({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`sticker-tab ${
        active
          ? "bg-brand-600 text-white shadow-[0_3px_0_#c2410c]"
          : "bg-white text-stone-600 ring-2 ring-stone-200"
      }`}
    >
      {label}
    </Link>
  );
}
