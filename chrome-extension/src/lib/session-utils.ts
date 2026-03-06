import type { FocusSession } from "./types";

export function getStreak(sessions: FocusSession[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => new Date(s.completedAt).toDateString()));
  let streak = 0;
  const now = new Date();
  for (let i = 0; i <= 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (days.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function getSessionsForRange(
  sessions: FocusSession[],
  startDate: Date,
  endDate: Date,
): FocusSession[] {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return sessions.filter((s) => s.completedAt >= start && s.completedAt <= end);
}

export function groupSessionsByDay(sessions: FocusSession[]): Map<string, FocusSession[]> {
  const groups = new Map<string, FocusSession[]>();
  for (const session of sessions) {
    const key = new Date(session.completedAt).toDateString();
    const existing = groups.get(key) ?? [];
    existing.push(session);
    groups.set(key, existing);
  }
  return groups;
}

export function getMonthWeekData(
  sessions: FocusSession[],
  monthDate: Date,
): { weekStart: Date; weekEnd: Date; sessions: FocusSession[]; totalMins: number }[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const lastDay = new Date(year, month + 1, 0);

  const weeks: { weekStart: Date; weekEnd: Date; sessions: FocusSession[]; totalMins: number }[] =
    [];
  const current = new Date(year, month, 1);

  const mondayOffset = current.getDay() === 0 ? 6 : current.getDay() - 1;
  current.setDate(current.getDate() - mondayOffset);

  while (current <= lastDay) {
    const weekStart = new Date(current);
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekSessions = getSessionsForRange(sessions, weekStart, weekEnd);
    const totalMins = weekSessions.reduce((sum, s) => sum + s.durationMin, 0);

    weeks.push({ weekStart, weekEnd, sessions: weekSessions, totalMins });
    current.setDate(current.getDate() + 7);
  }

  return weeks;
}
