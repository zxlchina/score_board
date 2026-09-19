export function ScoreBadge({
  score,
  large,
}: {
  score: number;
  large?: boolean;
}) {
  const positive = score >= 0;
  return (
    <span
      className={`font-black tabular-nums ${large ? "text-3xl" : "text-2xl"} ${
        positive ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      {score}
    </span>
  );
}
