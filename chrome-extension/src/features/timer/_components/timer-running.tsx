import { useState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ProgressRing } from "@/components/ui/progress-ring";
import { sendMessage } from "@/lib/messaging";
import { activeSchedulesStorage, schedulesStorage } from "@/lib/storage";
import { formatTime } from "@/lib/time-utils";
import { WARMUP_DURATION_MS } from "@/lib/constants";
import type { ActiveScheduleInfo, Schedule } from "@/lib/types";
import { StatsRow } from "./stats-row";

interface TimerRunningProps {
  remainingMs: number;
  progress: number;
  isWarmup: boolean;
  scheduleId: string | null;
  startedAt: number | null;
}

export function TimerRunning({
  remainingMs,
  progress,
  isWarmup,
  scheduleId,
  startedAt,
}: TimerRunningProps): ReactNode {
  const [activeSchedules, setActiveSchedules] = useState<ActiveScheduleInfo[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    if (!scheduleId) return;
    void activeSchedulesStorage.getValue().then(setActiveSchedules);
    const unwatch = activeSchedulesStorage.watch((v: ActiveScheduleInfo[] | null) => {
      setActiveSchedules(v ?? []);
    });
    return unwatch;
  }, [scheduleId]);

  useEffect(() => {
    if (!scheduleId) return;
    void schedulesStorage.getValue().then(setSchedules);
    const unwatch = schedulesStorage.watch((v: Schedule[] | null) => {
      setSchedules(v ?? []);
    });
    return unwatch;
  }, [scheduleId]);

  const scheduleName = scheduleId
    ? (activeSchedules.find((s) => s.id === scheduleId)?.name ??
      schedules.find((s) => s.id === scheduleId)?.name)
    : null;

  const formatted = formatTime(remainingMs);
  const [mins, secs] = formatted.split(":");

  const warmupRemainingMs = startedAt
    ? Math.max(0, WARMUP_DURATION_MS - (Date.now() - startedAt))
    : 0;
  const warmupFormatted = formatTime(warmupRemainingMs);

  const handlePause = () => {
    void sendMessage({ type: "PAUSE_TIMER" });
  };

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <ProgressRing progress={progress} size={140} strokeWidth={3} variant="sage">
          <div className="flex flex-col items-center justify-center">
            <div className="text-tunl-text font-mono text-[32px] leading-none font-light tracking-tight">
              {mins}
              <span className="animate-blink-colon text-tunl-dim">:</span>
              {secs}
            </div>
          </div>
        </ProgressRing>

        <div className="text-tunl-sage text-[9px] font-semibold tracking-[1.6px] uppercase">
          Focusing
        </div>

        {scheduleName && (
          <div className="text-tunl-text-2 bg-tunl-surface border-tunl-border rounded-full border px-3 py-1 text-[11px]">
            {scheduleName}
          </div>
        )}

        <div className="mt-2">
          {isWarmup ? (
            <Button variant="locked">
              <Icon size={13}>
                <rect x="6" y="11" width="12" height="9" rx="2" />
                <path d="M10 11V7a2 2 0 1 1 4 0v4" />
              </Icon>
              {warmupFormatted}
            </Button>
          ) : (
            <Button variant="ghost" onClick={handlePause}>
              <Icon size={13}>
                <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
              </Icon>
              Pause
            </Button>
          )}
        </div>
      </div>
      <StatsRow />
    </div>
  );
}
