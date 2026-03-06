import type { FocusSession } from "@/lib/types";

export type DashRange = "day" | "week" | "month";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getPeriodBounds(range: DashRange, offset: number): { start: Date; end: Date } {
  const now = new Date();

  if (range === "day") {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return { start: d, end };
  }

  if (range === "week") {
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(monday.getDate() - mondayOffset + offset * 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  }

  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start: d, end };
}

export function formatPeriodLabel(range: DashRange, offset: number): string {
  const { start, end } = getPeriodBounds(range, offset);

  if (range === "day") {
    return `${DAY_NAMES[start.getDay()]}, ${MONTH_NAMES[start.getMonth()]} ${start.getDate()}`;
  }
  if (range === "week") {
    return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} \u2013 ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}`;
  }
  return `${FULL_MONTHS[start.getMonth()]} ${start.getFullYear()}`;
}

export interface WeekDayData {
  label: string;
  mins: number;
  isToday: boolean;
}

export function getWeekData(sessions: FocusSession[], start: Date): WeekDayData[] {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().toDateString();

  return labels.map((label, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toDateString();
    const mins = sessions
      .filter((s) => new Date(s.completedAt).toDateString() === dateStr)
      .reduce((sum, s) => sum + s.durationMin, 0);
    return { label, mins, isToday: dateStr === today };
  });
}

export function convertOffset(
  fromRange: DashRange,
  toRange: DashRange,
  fromOffset: number,
): number {
  if (fromOffset === 0) return 0;

  const { start, end } = getPeriodBounds(fromRange, fromOffset);
  const viewDate = new Date((start.getTime() + end.getTime()) / 2);
  const now = new Date();

  if (toRange === "day") {
    const viewDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate());
    const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((viewDay.getTime() - todayDay.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (toRange === "week") {
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const thisMonday = new Date(now);
    thisMonday.setDate(thisMonday.getDate() - mondayOffset);
    thisMonday.setHours(0, 0, 0, 0);
    return Math.floor((viewDate.getTime() - thisMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  }

  return (viewDate.getFullYear() - now.getFullYear()) * 12 + (viewDate.getMonth() - now.getMonth());
}

export function getBestDayMins(sessions: FocusSession[]): number {
  const dayTotals = new Map<string, number>();
  for (const s of sessions) {
    const key = new Date(s.completedAt).toDateString();
    dayTotals.set(key, (dayTotals.get(key) ?? 0) + s.durationMin);
  }
  return Math.max(0, ...dayTotals.values());
}

export function getDaysInPeriod(range: DashRange, start: Date, end: Date): number {
  if (range === "week") return 7;
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export interface DayGroup {
  date: Date;
  dateStr: string;
  sessions: FocusSession[];
  totalMins: number;
}

export function groupSessionsByDayList(sessions: FocusSession[]): DayGroup[] {
  const dayMap = new Map<string, FocusSession[]>();
  for (const s of sessions) {
    const key = new Date(s.completedAt).toDateString();
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push(s);
  }
  return Array.from(dayMap.entries())
    .map(([dateStr, sess]) => ({
      date: new Date(dateStr),
      dateStr,
      sessions: sess.sort((a, b) => b.completedAt - a.completedAt),
      totalMins: sess.reduce((s, x) => s + x.durationMin, 0),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
