export function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatPoints(points: number): string {
  if (points > 0) return `+${points}`;
  return String(points);
}
