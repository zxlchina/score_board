"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, playSfx, setSoundEnabled } from "@/lib/sound";

export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isSoundEnabled());
    const sync = () => setOn(isSoundEnabled());
    window.addEventListener("scoreboard-sound-change", sync);
    return () => window.removeEventListener("scoreboard-sound-change", sync);
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    setSoundEnabled(next);
    if (next) playSfx("toggle");
  }

  return (
    <button
      type="button"
      data-sfx-skip
      onClick={toggle}
      aria-pressed={on}
      title={on ? "关闭音效" : "打开音效"}
      className={`rounded-full px-2.5 py-1.5 text-base ${
        on
          ? "bg-brand-100 text-brand-800"
          : "bg-white text-stone-400 ring-2 ring-stone-200"
      }`}
    >
      <span className="sr-only">{on ? "关闭音效" : "打开音效"}</span>
      {on ? "🔊" : "🔇"}
    </button>
  );
}
