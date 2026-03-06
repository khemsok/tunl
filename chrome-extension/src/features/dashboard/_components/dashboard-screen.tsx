import type { ReactNode } from "react";
import { formatHoursMins } from "@/lib/time-utils";
import { useStreak } from "@/hooks/use-streak";
import { StatCard } from "@/components/ui/stat-card";
import { Pill } from "@/components/ui/pill";
import { useDashboard } from "../_hooks/use-dashboard";
import { getBestDayMins, getDaysInPeriod } from "../_lib/dashboard-utils";
import { TabPicker } from "./tab-picker";
import { PeriodNav } from "./period-nav";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import { HistoryList } from "./history-list";

export function DashboardScreen(): ReactNode {
  const {
    range,
    isToday,
    periodLabel,
    periodBounds,
    periodSessions,
    setRange,
    prev,
    next,
    goToday,
    allSessions,
  } = useDashboard();
  const streak = useStreak(allSessions);

  const totalMins = periodSessions.reduce((sum, s) => sum + s.durationMin, 0);
  const sessionCount = periodSessions.length;

  return (
    <div className="scrollbar-none space-y-2.5 overflow-y-auto px-4 pt-2.5 pb-2">
      {streak > 0 && (
        <div className="flex justify-center">
          <Pill variant="amber">
            🔥 {streak} day{streak !== 1 ? "s" : ""}
          </Pill>
        </div>
      )}

      <div className="flex flex-col items-center gap-2.5">
        <TabPicker value={range} onChange={setRange} />
        <PeriodNav
          label={periodLabel}
          isToday={isToday}
          onPrev={prev}
          onNext={next}
          onToday={goToday}
        />
      </div>

      <div className="min-h-[110px]">
        {range === "day" && <DayView sessions={periodSessions} />}
        {range === "week" && (
          <WeekView sessions={periodSessions} periodStart={periodBounds.start} />
        )}
        {range === "month" && (
          <MonthView sessions={periodSessions} periodStart={periodBounds.start} />
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {range === "day" ? (
          <>
            <StatCard value={formatHoursMins(totalMins)} label="Total" />
            <StatCard value={String(sessionCount)} label="Sessions" />
            <StatCard value={streak > 0 ? `🔥 ${streak}` : "0"} label="Streak" />
            <StatCard
              value={String(periodSessions.reduce((sum, s) => sum + s.blockAttempts, 0))}
              label="Blocked"
            />
          </>
        ) : (
          <>
            <StatCard value={formatHoursMins(totalMins)} label="Total" />
            <StatCard value={String(sessionCount)} label="Sessions" />
            <StatCard
              value={formatHoursMins(
                Math.round(
                  totalMins / getDaysInPeriod(range, periodBounds.start, periodBounds.end),
                ),
              )}
              label="Avg / Day"
            />
            <StatCard value={formatHoursMins(getBestDayMins(periodSessions))} label="Best Day" />
          </>
        )}
      </div>

      {range !== "day" && <HistoryList sessions={periodSessions} />}
    </div>
  );
}
