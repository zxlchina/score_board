import Link from "next/link";
import { ChildAvatar } from "@/components/ChildAvatar";
import { CrownIcon } from "@/components/CrownIcon";
import { ScoreBadge } from "@/components/ScoreBadge";
import type { RankPeriod } from "@/lib/ranking";
import type { ChildWithScore } from "@/lib/services/scores";

function championHint(period: RankPeriod): string {
  if (period === "week") return "本周第一 · 太棒了";
  if (period === "month") return "本月第一 · 太棒了";
  return "积分第一 · 太棒了";
}

function rankStyles(rank: number): string {
  if (rank === 1) {
    return "border-amber-300 bg-gradient-to-br from-yellow-50 via-white to-orange-50 ring-2 ring-amber-200";
  }
  if (rank === 2) {
    return "border-sky-200 bg-gradient-to-br from-sky-50 to-white";
  }
  if (rank === 3) {
    return "border-orange-200 bg-gradient-to-br from-orange-50 to-white";
  }
  return "border-[color:var(--theme-border)] bg-white";
}

function rankBadge(rank: number): string {
  if (rank === 1) return "bg-amber-300 text-amber-950";
  if (rank === 2) return "bg-sky-200 text-sky-900";
  if (rank === 3) return "bg-orange-300 text-orange-950";
  return "bg-brand-100 text-brand-800";
}

export function Leaderboard({
  entries,
  period = "all",
}: {
  entries: ChildWithScore[];
  period?: RankPeriod;
}) {
  if (entries.length === 0) {
    return (
      <div className="card text-center text-sm font-medium text-stone-500">
        还没有启用中的小朋友，管理员登录后可添加。
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((c, index) => {
        const rank = index + 1;
        const isChampion = rank === 1;

        return (
          <li
            key={c.id}
            className="animate-pop-in"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <Link
              href={`/children/${c.id}`}
              className={`card flex items-center gap-3 transition hover:-translate-y-0.5 hover:shadow-[0_10px_0_rgba(61,41,20,0.08)] ${rankStyles(rank)} ${isChampion ? "py-5" : ""}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black tabular-nums ${rankBadge(rank)} ${isChampion ? "h-11 w-11 text-base" : ""}`}
              >
                {rank}
              </span>

              <ChildAvatar
                childId={c.id}
                avatarKind={c.avatarKind}
                avatarValue={c.avatarValue}
                size={isChampion ? "lg" : "md"}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {isChampion && (
                    <CrownIcon className="h-5 w-5 shrink-0 animate-wiggle text-amber-500 drop-shadow-sm" />
                  )}
                  <span
                    className={`truncate font-black text-stone-800 ${isChampion ? "text-xl" : "text-lg"}`}
                  >
                    {c.name}
                  </span>
                </div>
                {isChampion && (
                  <p className="mt-0.5 text-xs font-bold text-amber-700">
                    {championHint(period)}
                  </p>
                )}
              </div>

              <ScoreBadge score={c.totalScore} large={isChampion} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
