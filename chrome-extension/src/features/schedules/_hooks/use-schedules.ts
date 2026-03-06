import { useState, useEffect, useCallback, useMemo } from "react";
import { schedulesStorage, activeSchedulesStorage, timerStorage } from "@/lib/storage";
import { sendMessage } from "@/lib/messaging";
import type { Schedule, ActiveScheduleInfo, TimerState } from "@/lib/types";

interface UseSchedulesReturn {
  schedules: Schedule[];
  activeSchedules: ActiveScheduleInfo[];
  isScheduleActive: (id: string) => boolean;
  isSessionActive: boolean;
  save: (schedule: Schedule) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle: (id: string) => Promise<void>;
}

export function useSchedules(): UseSchedulesReturn {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeSchedules, setActiveSchedules] = useState<ActiveScheduleInfo[]>([]);
  const [timer, setTimer] = useState<TimerState | null>(null);

  useEffect(() => {
    void schedulesStorage.getValue().then(setSchedules);
    const unwatch = schedulesStorage.watch((v: Schedule[] | null) => {
      if (v) setSchedules(v);
    });
    return unwatch;
  }, []);

  useEffect(() => {
    void activeSchedulesStorage.getValue().then(setActiveSchedules);
    const unwatch = activeSchedulesStorage.watch((v: ActiveScheduleInfo[] | null) => {
      if (v) setActiveSchedules(v);
    });
    return unwatch;
  }, []);

  useEffect(() => {
    void timerStorage.getValue().then(setTimer);
    const unwatch = timerStorage.watch((v: TimerState | null) => {
      if (v) setTimer(v);
    });
    return unwatch;
  }, []);

  const isSessionActive = timer?.status === "running" || timer?.status === "paused";

  const activeIds = useMemo(() => new Set(activeSchedules.map((s) => s.id)), [activeSchedules]);

  const isScheduleActive = useCallback((id: string) => activeIds.has(id), [activeIds]);

  const save = useCallback(async (schedule: Schedule) => {
    await sendMessage({ type: "SAVE_SCHEDULE", schedule });
  }, []);

  const remove = useCallback(async (id: string) => {
    await sendMessage({ type: "DELETE_SCHEDULE", id });
  }, []);

  const toggle = useCallback(async (id: string) => {
    await sendMessage({ type: "TOGGLE_SCHEDULE", id });
  }, []);

  return { schedules, activeSchedules, isScheduleActive, isSessionActive, save, remove, toggle };
}
