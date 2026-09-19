export type RankPeriod = "all" | "week" | "month";

export const RANK_PERIODS: { id: RankPeriod; label: string }[] = [
  { id: "all", label: "总榜" },
  { id: "week", label: "周榜" },
  { id: "month", label: "月榜" },
];

/** 周一 0:00 起（本地时区） */
export function startOfWeekLocal(now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

export function startOfMonthLocal(now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
}

export function sinceForPeriod(period: RankPeriod): Date | null {
  if (period === "all") return null;
  if (period === "week") return startOfWeekLocal();
  return startOfMonthLocal();
}

export function parseRankPeriod(raw?: string): RankPeriod {
  if (raw === "week" || raw === "month") return raw;
  return "all";
}

export function rankPeriodSubtitle(period: RankPeriod): string {
  if (period === "week") return "本周积分 · 点击查看明细";
  if (period === "month") return "本月积分 · 点击查看明细";
  return "累计总积分 · 点击查看明细";
}
