import type { ReactNode } from "react";
import { useTimer } from "../_hooks/use-timer";
import { TimerIdle } from "./timer-idle";
import { TimerRunning } from "./timer-running";
import { TimerPaused } from "./timer-paused";
import { TimerCompleted } from "./timer-completed";
import { EndConfirmation } from "./end-confirmation";

export function TimerScreen(): ReactNode {
  const { timer, remainingMs, progress, isWarmup } = useTimer();

  if (timer.status === "end_confirmation") {
    return <EndConfirmation endConfirmStartedAt={timer.endConfirmStartedAt} />;
  }

  if (timer.status === "paused") {
    return <TimerPaused remainingMs={remainingMs} progress={progress} />;
  }

  if (timer.status === "running") {
    return (
      <TimerRunning
        remainingMs={remainingMs}
        progress={progress}
        isWarmup={isWarmup}
        scheduleId={timer.scheduleId}
        startedAt={timer.sessionStartedAt}
      />
    );
  }

  if (timer.remainingMs === 0 && timer.durationMs > 0) {
    return <TimerCompleted durationMs={timer.durationMs} />;
  }

  return <TimerIdle />;
}
