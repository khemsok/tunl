import type { Message, MessageResponse } from "@/lib/messaging";
import { timerStorage, schedulesStorage } from "@/lib/storage";
import { startTimer, pauseTimer, resumeTimer, requestEnd, confirmEnd, cancelEnd } from "./timer";
import { evaluateSchedules } from "./schedules";

export async function handleMessage(msg: Message): Promise<MessageResponse> {
  switch (msg.type) {
    case "START_TIMER":
      await startTimer(msg.durationMs);
      return { ok: true };

    case "PAUSE_TIMER":
      await pauseTimer();
      return { ok: true };

    case "RESUME_TIMER":
      await resumeTimer();
      return { ok: true };

    case "REQUEST_END":
      await requestEnd();
      return { ok: true };

    case "CONFIRM_END":
      await confirmEnd();
      return { ok: true };

    case "CANCEL_END":
      await cancelEnd();
      return { ok: true };

    case "BLOCK_ATTEMPT": {
      const timer = await timerStorage.getValue();
      if (timer.status === "running" || timer.status === "paused") {
        await timerStorage.setValue({ ...timer, blockAttempts: timer.blockAttempts + 1 });
      }
      return { ok: true };
    }

    case "SAVE_SCHEDULE": {
      const schedules = await schedulesStorage.getValue();
      const idx = schedules.findIndex((s) => s.id === msg.schedule.id);
      if (idx >= 0) {
        schedules[idx] = msg.schedule;
      } else {
        schedules.push(msg.schedule);
      }
      await schedulesStorage.setValue(schedules);
      await evaluateSchedules();
      return { ok: true };
    }

    case "DELETE_SCHEDULE": {
      const schedules = await schedulesStorage.getValue();
      await schedulesStorage.setValue(schedules.filter((s) => s.id !== msg.id));
      await evaluateSchedules();
      return { ok: true };
    }

    case "TOGGLE_SCHEDULE": {
      const schedules = await schedulesStorage.getValue();
      const schedule = schedules.find((s) => s.id === msg.id);
      if (!schedule) return { ok: false, error: "Schedule not found" };
      schedule.enabled = !schedule.enabled;
      await schedulesStorage.setValue(schedules);
      await evaluateSchedules();
      return { ok: true };
    }

    case "END_SCHEDULE": {
      const schedules = await schedulesStorage.getValue();
      const schedule = schedules.find((s) => s.id === msg.id);
      if (!schedule) return { ok: false, error: "Schedule not found" };
      schedule.enabled = false;
      await schedulesStorage.setValue(schedules);
      await evaluateSchedules(true);
      return { ok: true };
    }

    default:
      return { ok: false, error: "Unknown message type" };
  }
}
