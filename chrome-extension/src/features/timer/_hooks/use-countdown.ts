import { useState, useEffect, useMemo } from "react";

interface UseCountdownReturn {
  remainingMs: number;
  progress: number;
  isComplete: boolean;
}

export function useCountdown(startedAt: number | null, durationMs: number): UseCountdownReturn {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => {
      setNow(Date.now());
    }, 100);
    return () => {
      clearInterval(id);
    };
  }, [startedAt]);

  const remainingMs = useMemo(() => {
    if (!startedAt) return durationMs;
    return Math.max(0, durationMs - (now - startedAt));
  }, [startedAt, durationMs, now]);

  const progress = useMemo(() => {
    if (!startedAt) return 1;
    return Math.max(0, remainingMs / durationMs);
  }, [startedAt, remainingMs, durationMs]);

  const isComplete = remainingMs === 0;

  return { remainingMs, progress, isComplete };
}
