export function FloatingBubbles() {
  const bubbles = [
    { className: "left-[6%] top-[8%] h-36 w-36 bg-amber-200/80 animate-float-a" },
    { className: "right-[4%] top-[10%] h-28 w-28 bg-pink-200/80 animate-float-b" },
    { className: "right-[8%] bottom-[8%] h-40 w-40 bg-sky-200/80 animate-float-c" },
    { className: "left-[3%] bottom-[10%] h-32 w-32 bg-lime-200/80 animate-float-d" },
    { className: "left-[42%] top-[28%] h-16 w-16 bg-orange-200/70 animate-float-b" },
    { className: "right-[28%] bottom-[28%] h-14 w-14 bg-violet-200/70 animate-float-a" },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {bubbles.map((b, i) => (
        <span key={i} className={`absolute rounded-full blur-[1px] ${b.className}`} />
      ))}
    </div>
  );
}
