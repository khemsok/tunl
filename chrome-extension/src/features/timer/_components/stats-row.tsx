import type { ReactNode } from "react";
import { useMemo } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { useSessions } from "@/hooks/use-sessions";
import { useStreak } from "@/hooks/use-streak";

export function StatsRow(): ReactNode {
  const sessions = useSessions();
  const streak = useStreak(sessions);

  const { todayCount, todayMins } = useMemo(() => {
    const todayStr = new Date().toDateString();
    const today = sessions.filter((s) => new Date(s.completedAt).toDateString() === todayStr);
    return {
      todayCount: today.length,
      todayMins: today.reduce((sum, s) => sum + s.durationMin, 0),
    };
  }, [sessions]);

  const focusedLabel =
    todayMins < 60 ? `${todayMins}m` : `${Math.floor(todayMins / 60)}h ${todayMins % 60}m`;

  return (
    <div className="grid w-full grid-cols-3 gap-1.5 px-4 pt-4 pb-3">
      <StatCard value={String(todayCount)} label="Sessions" />
      <StatCard value={String(streak)} label="Streak" />
      <StatCard value={focusedLabel} label="Focused" />
    </div>
  );
}
