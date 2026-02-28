import { useState, useEffect } from "react";
import { CELEBRATION_COLORS, COLORS } from "../theme";

export function useCelebration(active: boolean): string {
  const [celebrationColor, setCelebrationColor] = useState<string>(COLORS.highlight);

  useEffect(() => {
    if (!active) return;

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % CELEBRATION_COLORS.length;
      setCelebrationColor(CELEBRATION_COLORS[idx]);
    }, 400);

    return () => clearInterval(interval);
  }, [active]);

  return celebrationColor;
}
