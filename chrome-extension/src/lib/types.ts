export type TimerStatus = "idle" | "running" | "paused" | "end_confirmation";

export interface TimerState {
  status: TimerStatus;
  durationMs: number;
  remainingMs: number;
  startedAt: number | null;
  sessionStartedAt: number | null;
  sessionId: string | null;
  blockAttempts: number;
  scheduleId: string | null;
  endConfirmStartedAt: number | null;
  previousStatus: "running" | "paused" | null;
}

export interface FocusSession {
  id: string;
  startedAt: number;
  durationMin: number;
  completedAt: number;
  blockAttempts: number;
  scheduleId?: string;
  source: "manual" | "schedule";
}

export interface Schedule {
  id: string;
  name: string;
  days: number[];
  startMin: number;
  endMin: number;
  blockedSites: string[];
  enabled: boolean;
}

export interface ActiveScheduleInfo {
  id: string;
  name: string;
  endMin: number;
}
