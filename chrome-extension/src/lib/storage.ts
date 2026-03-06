import { storage } from "wxt/utils/storage";
import type { TimerState, FocusSession, Schedule, ActiveScheduleInfo } from "./types";
import { DEFAULT_BLOCKED_SITES, DEFAULT_SCHEDULES } from "./constants";

const DEFAULT_TIMER: TimerState = {
  status: "idle",
  durationMs: 25 * 60 * 1000,
  remainingMs: 25 * 60 * 1000,
  startedAt: null,
  sessionStartedAt: null,
  sessionId: null,
  blockAttempts: 0,
  scheduleId: null,
  endConfirmStartedAt: null,
  previousStatus: null,
};

export const timerStorage = storage.defineItem<TimerState>("local:timer", {
  defaultValue: DEFAULT_TIMER,
});

export const blockedSitesStorage = storage.defineItem<string[]>("local:blockedSites", {
  defaultValue: DEFAULT_BLOCKED_SITES,
});

export const defaultDurationStorage = storage.defineItem<number>("local:defaultDurationMin", {
  defaultValue: 25,
});

export const autoStartStorage = storage.defineItem<boolean>("local:autoStartNext", {
  defaultValue: false,
});

export const sessionsStorage = storage.defineItem<FocusSession[]>("local:sessions", {
  defaultValue: [],
});

export const longestStreakStorage = storage.defineItem<number>("local:longestStreak", {
  defaultValue: 0,
});

export const schedulesStorage = storage.defineItem<Schedule[]>("local:schedules", {
  defaultValue: DEFAULT_SCHEDULES,
});

export const activeSchedulesStorage = storage.defineItem<ActiveScheduleInfo[]>(
  "session:activeSchedules",
  { defaultValue: [] },
);
