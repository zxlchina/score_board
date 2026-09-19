"use client";

import { useEffect } from "react";
import { isSoundEnabled, playSfx } from "@/lib/sound";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!isSoundEnabled()) return;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (el.closest("[data-sfx-skip]")) return;
      if (el.closest("a, button, [role='button'], label, summary")) {
        playSfx("click");
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return <>{children}</>;
}
