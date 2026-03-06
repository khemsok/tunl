import {
  schedulesStorage,
  timerStorage,
  activeSchedulesStorage,
  sessionsStorage,
  longestStreakStorage,
} from "@/lib/storage";
import type { FocusSession } from "@/lib/types";
import { getStreak } from "@/lib/session-utils";
import { enableScheduleBlocking, disableScheduleBlocking } from "./blocking";


function isInWindow(currentMin: number, startMin: number, endMin: number): boolean {
  if (startMin <= endMin) {
    return currentMin >= startMin && currentMin < endMin;
  }
  return currentMin >= startMin || currentMin < endMin;
}

function getScheduleDurationMin(startMin: number, endMin: number): number {
  if (endMin > startMin) return endMin - startMin;
  return 1440 - startMin + endMin;
}

async function recordScheduleSession(scheduleId: string, startMin: number, endMin: number): Promise<void> {
  const durationMin = getScheduleDurationMin(startMin, endMin);
  const session: FocusSession = {
    id: crypto.randomUUID(),
    startedAt: Date.now() - durationMin * 60000,
    durationMin,
    completedAt: Date.now(),
    blockAttempts: 0,
    source: "schedule",
    scheduleId,
  };

  const sessions = await sessionsStorage.getValue();
  sessions.push(session);
  await sessionsStorage.setValue(sessions);

  const streak = getStreak(sessions);
  const longestStreak = await longestStreakStorage.getValue();
  if (streak > longestStreak) {
    await longestStreakStorage.setValue(streak);
  }
}

export async function evaluateSchedules(skipSessionRecording = false): Promise<void> {
  const schedules = await schedulesStorage.getValue();
  const previousActive = await activeSchedulesStorage.getValue();
  const now = new Date();
  const currentDay = now.getDay();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const active = schedules.filter(
    (s) => s.enabled && s.days.includes(currentDay) && isInWindow(currentMin, s.startMin, s.endMin),
  );

  if (!skipSessionRecording) {
    const activeIds = new Set(active.map((s) => s.id));
    const ended = previousActive.filter((s) => !activeIds.has(s.id));

    for (const s of ended) {
      const schedule = schedules.find((sch) => sch.id === s.id);
      if (schedule) {
        await recordScheduleSession(s.id, schedule.startMin, schedule.endMin);
      }
    }
  }

  const scheduledSites = [...new Set(active.flatMap((s) => s.blockedSites))];

  const timer = await timerStorage.getValue();
  const isManualSession = timer.status === "running" || timer.status === "paused";

  if (active.length > 0) {
    await enableScheduleBlocking(scheduledSites);
  } else {
    await disableScheduleBlocking();
  }

  const sorted = [...active].sort((a, b) => {
    const remA = a.endMin > currentMin ? a.endMin - currentMin : 1440 - currentMin + a.endMin;
    const remB = b.endMin > currentMin ? b.endMin - currentMin : 1440 - currentMin + b.endMin;
    return remB - remA;
  });
  await activeSchedulesStorage.setValue(
    sorted.map((s) => ({ id: s.id, name: s.name, endMin: s.endMin })),
  );
}
