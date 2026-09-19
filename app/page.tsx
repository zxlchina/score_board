import { Leaderboard } from "@/components/Leaderboard";
import { LeaderboardPeriodTabs } from "@/components/LeaderboardPeriodTabs";
import { parseRankPeriod, rankPeriodSubtitle } from "@/lib/ranking";
import { listActiveChildrenRanked } from "@/lib/services/scores";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ period?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const period = parseRankPeriod(sp.period);
  const children = listActiveChildrenRanked(period);

  return (
    <div>
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white text-4xl shadow-[0_6px_0_#fde68a] ring-2 ring-amber-200">
          <span className="animate-bob">🏆</span>
        </div>
        <h1 className="page-title">积分排行榜</h1>
        <p className="page-sub mt-1">{rankPeriodSubtitle(period)}</p>
      </div>

      <LeaderboardPeriodTabs active={period} />
      <Leaderboard entries={children} period={period} />
    </div>
  );
}
