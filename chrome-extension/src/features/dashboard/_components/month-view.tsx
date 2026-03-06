import type { ReactNode } from "react";
import type { FocusSession } from "@/lib/types";
import { formatHoursMins } from "@/lib/time-utils";
import { getMonthWeekData } from "@/lib/session-utils";

interface MonthViewProps {
  sessions: FocusSession[];
  periodStart: Date;
}

export function MonthView({ sessions, periodStart }: MonthViewProps): ReactNode {
  const weeks = getMonthWeekData(sessions, periodStart);
  const maxMins = Math.max(...weeks.map((w) => w.totalMins), 1);
  const today = new Date();
  const isEmpty = weeks.every((w) => w.totalMins === 0);

  if (isEmpty) {
    return <div className="text-tunl-muted py-6 text-center text-sm">No sessions this month</div>;
  }

  return (
    <div className="space-y-2">
      {weeks.map((w, i) => {
        const isCurrent = today >= w.weekStart && today <= w.weekEnd;
        const widthPct = w.totalMins > 0 ? Math.max(4, (w.totalMins / maxMins) * 100) : 0;

        return (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-tunl-muted w-5 shrink-0 font-mono text-[10px]">W{i + 1}</span>
            <div className="bg-tunl-surface h-5 flex-1 overflow-hidden rounded">
              {w.totalMins > 0 && (
                <div
                  className={`animate-hbar-grow h-full rounded ${
                    isCurrent
                      ? "bg-tunl-sage shadow-[0_0_10px_rgba(122,173,122,0.25)]"
                      : "bg-tunl-sage opacity-50"
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              )}
            </div>
            <span className="text-tunl-text-2 w-8 shrink-0 text-right font-mono text-[10px]">
              {w.totalMins > 0 ? formatHoursMins(w.totalMins) : "\u2014"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
