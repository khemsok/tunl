import { useState, useEffect } from "react";

import type { TimerStatus } from "./use-timer";

export function useAnimation(timerStatus: TimerStatus): {
  animTick: number;
  resetAnimation: () => void;
} {
  const [animTick, setAnimTick] = useState(0);

  useEffect(() => {
    if (timerStatus !== "running" && timerStatus !== "paused") return;

    const interval = setInterval(() => {
      setAnimTick((t) => t + 1);
    }, 800);

    return () => clearInterval(interval);
  }, [timerStatus]);

  function resetAnimation(): void {
    setAnimTick(0);
  }

  return { animTick, resetAnimation };
}
