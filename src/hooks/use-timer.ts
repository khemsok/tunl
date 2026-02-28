import { useState, useEffect } from "react";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

export type UseTimerResult = {
  timerStatus: TimerStatus;
  totalSeconds: number;
  remainingSeconds: number;
  setTimerStatus: (status: TimerStatus) => void;
  adjustDuration: (deltaSeconds: number) => void;
  resetTimer: () => void;
  setDuration: (seconds: number) => void;
};

export function useTimer(
  initialSeconds: number,
  onFinish: () => void,
): UseTimerResult {
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (timerStatus !== "running") return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerStatus("finished");
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStatus]);

  function adjustDuration(deltaSeconds: number): void {
    const newTotal = Math.max(totalSeconds + deltaSeconds, 60);
    setTotalSeconds(newTotal);
    setRemainingSeconds(newTotal);
  }

  function resetTimer(): void {
    setTimerStatus("idle");
    setRemainingSeconds(totalSeconds);
  }

  function setDuration(seconds: number): void {
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
  }

  return {
    timerStatus,
    totalSeconds,
    remainingSeconds,
    setTimerStatus,
    adjustDuration,
    resetTimer,
    setDuration,
  };
}
