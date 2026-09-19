import Link from "next/link";
import { RANK_PERIODS, type RankPeriod } from "@/lib/ranking";

const ICONS: Record<RankPeriod, string> = {
  all: "🌈",
  week: "📅",
  month: "🌙",
};

export function LeaderboardPeriodTabs({ active }: { active: RankPeriod }) {
  return (
    <div className="mb-5 flex justify-center gap-2">
      {RANK_PERIODS.map((p) => {
        const href = p.id === "all" ? "/" : `/?period=${p.id}`;
        const isActive = active === p.id;
        return (
          <Link
            key={p.id}
            href={href}
            className={`sticker-tab ${
              isActive
                ? "bg-brand-600 text-white shadow-[0_3px_0_#c2410c]"
                : "bg-white text-stone-600 ring-2 ring-stone-200 hover:bg-brand-50"
            }`}
          >
            <span className="mr-1">{ICONS[p.id]}</span>
            {p.label}
          </Link>
        );
      })}
    </div>
  );
}
