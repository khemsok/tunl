import type { TimerState } from "./types";

export function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatHoursMins(totalMins: number): string {
  if (totalMins < 60) return `${totalMins}m`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatMinFromMidnight(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  const period = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function getRemainingMs(timer: TimerState): number {
  if (timer.status === "running" && timer.startedAt) {
    return Math.max(0, timer.remainingMs - (Date.now() - timer.startedAt));
  }
  return timer.remainingMs;
}

export function getProgress(timer: TimerState): number {
  const remaining = getRemainingMs(timer);
  return timer.durationMs > 0 ? 1 - remaining / timer.durationMs : 0;
}
