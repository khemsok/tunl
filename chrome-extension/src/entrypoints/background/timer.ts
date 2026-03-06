import {
  timerStorage,
  blockedSitesStorage,
  sessionsStorage,
  longestStreakStorage,
  defaultDurationStorage,
  autoStartStorage,
  activeSchedulesStorage,
} from "@/lib/storage";
import type { TimerState, FocusSession } from "@/lib/types";
import {
  ALARM_NAME,
  AUTO_START_ALARM,
  END_CONFIRM_DURATION_MS,
} from "@/lib/constants";
import { getStreak } from "@/lib/session-utils";
import { enableBlocking, disableBlocking } from "./blocking";

async function resetToIdle(): Promise<TimerState> {
  const defaultMin = await defaultDurationStorage.getValue();
  const durationMs = defaultMin * 60 * 1000;
  const timer: TimerState = {
    status: "idle",
    durationMs,
    remainingMs: durationMs,
    startedAt: null,
    sessionStartedAt: null,
    sessionId: null,
    blockAttempts: 0,
    scheduleId: null,
    endConfirmStartedAt: null,
    previousStatus: null,
  };
  await timerStorage.setValue(timer);
  await chrome.alarms.clear(ALARM_NAME);
  await disableBlocking();
  return timer;
}

export async function startTimer(durationMs: number): Promise<TimerState> {
  const activeSchedules = await activeSchedulesStorage.getValue();
  const now = Date.now();
  const timer: TimerState = {
    status: "running",
    durationMs,
    remainingMs: durationMs,
    startedAt: now,
    sessionStartedAt: now,
    sessionId: crypto.randomUUID(),
    blockAttempts: 0,
    scheduleId: activeSchedules.length > 0 ? activeSchedules[0].id : null,
    endConfirmStartedAt: null,
    previousStatus: null,
  };
  await timerStorage.setValue(timer);
  await chrome.alarms.create(ALARM_NAME, { delayInMinutes: durationMs / 60000 });
  const sites = await blockedSitesStorage.getValue();
  await enableBlocking(sites);
  return timer;
}

export async function pauseTimer(): Promise<TimerState> {
  const timer = await timerStorage.getValue();
  if (timer.status !== "running" || !timer.startedAt) return timer;

  const elapsed = Date.now() - timer.startedAt;
  const updated: TimerState = {
    ...timer,
    status: "paused",
    remainingMs: Math.max(0, timer.remainingMs - elapsed),
    startedAt: null,
  };
  await timerStorage.setValue(updated);
  await chrome.alarms.clear(ALARM_NAME);
  return updated;
}

export async function resumeTimer(): Promise<TimerState> {
  const timer = await timerStorage.getValue();
  if (timer.status !== "paused") return timer;

  const updated: TimerState = {
    ...timer,
    status: "running",
    startedAt: Date.now(),
  };
  await timerStorage.setValue(updated);
  await chrome.alarms.create(ALARM_NAME, { delayInMinutes: updated.remainingMs / 60000 });
  return updated;
}

export async function requestEnd(): Promise<TimerState> {
  const timer = await timerStorage.getValue();
  if (timer.status !== "running" && timer.status !== "paused") return timer;

  const updated: TimerState = {
    ...timer,
    status: "end_confirmation",
    previousStatus: timer.status,
    endConfirmStartedAt: Date.now(),
    startedAt: null,
  };
  await timerStorage.setValue(updated);
  await chrome.alarms.clear(ALARM_NAME);
  return updated;
}

export async function confirmEnd(): Promise<TimerState> {
  const timer = await timerStorage.getValue();
  if (timer.status !== "end_confirmation") return timer;

  if (
    !timer.endConfirmStartedAt ||
    Date.now() - timer.endConfirmStartedAt < END_CONFIRM_DURATION_MS
  ) {
    return timer;
  }

  return resetToIdle();
}

export async function cancelEnd(): Promise<TimerState> {
  const timer = await timerStorage.getValue();
  if (timer.status !== "end_confirmation" || !timer.previousStatus) return timer;

  if (timer.previousStatus === "running") {
    const updated: TimerState = {
      ...timer,
      status: "running",
      startedAt: Date.now(),
      endConfirmStartedAt: null,
      previousStatus: null,
    };
    await timerStorage.setValue(updated);
    await chrome.alarms.create(ALARM_NAME, { delayInMinutes: updated.remainingMs / 60000 });
    return updated;
  }

  const updated: TimerState = {
    ...timer,
    status: "paused",
    endConfirmStartedAt: null,
    previousStatus: null,
  };
  await timerStorage.setValue(updated);
  return updated;
}

export async function completeTimer(): Promise<TimerState> {
  const timer = await timerStorage.getValue();

  const session: FocusSession = {
    id: timer.sessionId ?? crypto.randomUUID(),
    startedAt: Date.now() - timer.durationMs,
    durationMin: Math.round(timer.durationMs / 60000),
    completedAt: Date.now(),
    blockAttempts: timer.blockAttempts,
    source: timer.scheduleId ? "schedule" : "manual",
    ...(timer.scheduleId ? { scheduleId: timer.scheduleId } : {}),
  };

  const sessions = await sessionsStorage.getValue();
  sessions.push(session);
  await sessionsStorage.setValue(sessions);

  const streak = getStreak(sessions);
  const longestStreak = await longestStreakStorage.getValue();
  if (streak > longestStreak) {
    await longestStreakStorage.setValue(streak);
  }

  const updated = await resetToIdle();

  void chrome.notifications.create("tunl-done", {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon/128.png"),
    title: "Session Complete",
    message: `${Math.round(timer.durationMs / 60000)} minutes of deep focus. Nice work.`,
  });

  const autoStart = await autoStartStorage.getValue();
  if (autoStart) {
    void chrome.alarms.create(AUTO_START_ALARM, { delayInMinutes: 2 / 60 });
  }

  return updated;
}
