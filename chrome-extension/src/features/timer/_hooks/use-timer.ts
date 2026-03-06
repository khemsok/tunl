import { useState, useEffect, useMemo } from "react";
import { timerStorage } from "@/lib/storage";
import { getRemainingMs, getProgress, formatTime } from "@/lib/time-utils";
import { WARMUP_DURATION_MS } from "@/lib/constants";
import type { TimerState } from "@/lib/types";

interface UseTimerReturn {
  timer: TimerState;
  remainingMs: number;
  progress: number;
  formatted: string;
  isWarmup: boolean;
  isActive: boolean;
}

export function useTimer(): UseTimerReturn {
  const [timer, setTimer] = useState<TimerState>({
    status: "idle",
    durationMs: 25 * 60 * 1000,
    remainingMs: 25 * 60 * 1000,
    startedAt: null,
    sessionStartedAt: null,
    sessionId: null,
    blockAttempts: 0,
    scheduleId: null,
    endConfirmStartedAt: null,
    previousStatus: null,
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    void timerStorage.getValue().then((v: TimerState | null) => {
      if (v) setTimer(v);
    });
    const unwatch = timerStorage.watch((value: TimerState | null) => {
      if (value) setTimer(value);
    });
    return unwatch;
  }, []);

  useEffect(() => {
    if (timer.status !== "running") return;
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [timer.status]);

  const remainingMs = useMemo(() => getRemainingMs(timer), [timer, now]);
  const progress = useMemo(() => getProgress(timer), [timer, now]);
  const formatted = useMemo(() => formatTime(remainingMs), [remainingMs]);

  const isWarmup = useMemo(() => {
    if (timer.status !== "running" || !timer.sessionStartedAt) return false;
    const elapsed = Date.now() - timer.sessionStartedAt;
    return elapsed < WARMUP_DURATION_MS;
  }, [timer.status, timer.sessionStartedAt, now]);

  const isActive = timer.status === "running" || timer.status === "paused";

  return { timer, remainingMs, progress, formatted, isWarmup, isActive };
}
