import type { ReactNode } from "react";
import type { FocusSession } from "@/lib/types";
import { formatHoursMins } from "@/lib/time-utils";
import { getWeekData } from "../_lib/dashboard-utils";

interface WeekViewProps {
  sessions: FocusSession[];
  periodStart: Date;
}

export function WeekView({ sessions, periodStart }: WeekViewProps): ReactNode {
  const weekData = getWeekData(sessions, periodStart);
  const maxMins = Math.max(...weekData.map((d) => d.mins), 1);

  return (
    <div className="flex h-[110px] items-end gap-[5px]">
      {weekData.map((d, i) => {
        const heightPct = d.mins > 0 ? Math.max(8, (d.mins / maxMins) * 100) : 0;
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center gap-1">
            <span className="text-tunl-text-2 h-3 font-mono text-[9px]">
              {d.mins > 0 ? formatHoursMins(d.mins) : ""}
            </span>
            <div className="flex w-full flex-1 items-end justify-center">
              {d.mins > 0 ? (
                <div
                  className={`animate-bar-grow w-full rounded-t-md ${
                    d.isToday
                      ? "bg-tunl-sage shadow-[0_0_10px_rgba(122,173,122,0.25)]"
                      : "bg-tunl-sage opacity-50"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              ) : (
                <div className="bg-tunl-surface h-[1px] w-full rounded-full opacity-40" />
              )}
            </div>
            <span
              className={`text-[10px] font-semibold ${
                d.isToday ? "text-tunl-sage" : "text-tunl-muted"
              }`}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
