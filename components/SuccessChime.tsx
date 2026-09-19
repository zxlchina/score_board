"use client";

import { useEffect } from "react";
import { playSfx } from "@/lib/sound";

export function SuccessChime({ play }: { play?: boolean }) {
  useEffect(() => {
    if (play) playSfx("reward");
  }, [play]);
  return null;
}
