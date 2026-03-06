import type { Schedule } from "@/lib/types";

export function isInWindow(currentMin: number, startMin: number, endMin: number): boolean {
  if (startMin <= endMin) return currentMin >= startMin && currentMin < endMin;
  return currentMin >= startMin || currentMin < endMin;
}

export function getNextScheduleToday(schedules: Schedule[]): Schedule | null {
  const now = new Date();
  const day = now.getDay();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const upcoming = schedules
    .filter((s) => s.enabled && s.days.includes(day) && s.startMin > currentMin)
    .sort((a, b) => a.startMin - b.startMin);

  return upcoming[0] ?? null;
}

export function parseTimeToMin(str: string): number {
  const [h, m] = str.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
