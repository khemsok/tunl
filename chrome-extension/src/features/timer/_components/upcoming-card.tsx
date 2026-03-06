import { useState, useEffect, useMemo, type ReactNode } from "react";
import { activeSchedulesStorage, schedulesStorage } from "@/lib/storage";
import { formatMinFromMidnight } from "@/lib/time-utils";
import type { ActiveScheduleInfo, Schedule } from "@/lib/types";

export function UpcomingCard(): ReactNode {
  const [activeSchedules, setActiveSchedules] = useState<ActiveScheduleInfo[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    void activeSchedulesStorage.getValue().then(setActiveSchedules);
    const unwatch = activeSchedulesStorage.watch((v: ActiveScheduleInfo[] | null) => {
      setActiveSchedules(v ?? []);
    });
    return unwatch;
  }, []);

  useEffect(() => {
    void schedulesStorage.getValue().then(setSchedules);
    const unwatch = schedulesStorage.watch((v: Schedule[] | null) => {
      setSchedules(v ?? []);
    });
    return unwatch;
  }, []);

  const nextSchedule = useMemo((): Schedule | null => {
    if (activeSchedules.length > 0) return null;
    const now = new Date();
    const currentDay = now.getDay();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const candidates = schedules
      .filter((s) => s.enabled && s.days.includes(currentDay) && s.startMin > currentMin)
      .sort((a, b) => a.startMin - b.startMin);
    return candidates.length > 0 ? candidates[0] : null;
  }, [schedules, activeSchedules]);

  if (activeSchedules.length > 0) {
    const activeSchedule = activeSchedules[0];
    return (
      <div className="bg-tunl-surface border-tunl-border mt-3 w-full rounded-xl border px-4 py-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="bg-tunl-sage animate-pulse-dot h-1.5 w-1.5 rounded-full" />
          <span className="text-tunl-muted text-[9px] font-semibold tracking-[1.2px] uppercase">
            Active Schedule
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-tunl-sage text-[13px] font-medium">{activeSchedule.name}</span>
          <span className="text-tunl-text-2 font-mono text-[11px]">
            ends {formatMinFromMidnight(activeSchedule.endMin)}
          </span>
        </div>
      </div>
    );
  }

  if (nextSchedule) {
    return (
      <div className="bg-tunl-surface border-tunl-border mt-3 w-full rounded-xl border px-4 py-3">
        <div className="mb-1 flex items-center gap-2">
          <span className="bg-tunl-dim h-1.5 w-1.5 rounded-full" />
          <span className="text-tunl-muted text-[9px] font-semibold tracking-[1.2px] uppercase">
            Next Schedule
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-tunl-text text-[13px] font-medium">{nextSchedule.name}</span>
          <span className="text-tunl-text-2 font-mono text-[11px]">
            {formatMinFromMidnight(nextSchedule.startMin)}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
