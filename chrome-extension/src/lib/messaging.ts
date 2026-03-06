import type { Schedule } from "./types";

export type Message =
  | { type: "START_TIMER"; durationMs: number }
  | { type: "PAUSE_TIMER" }
  | { type: "RESUME_TIMER" }
  | { type: "REQUEST_END" }
  | { type: "CONFIRM_END" }
  | { type: "CANCEL_END" }
  | { type: "BLOCK_ATTEMPT" }
  | { type: "SAVE_SCHEDULE"; schedule: Schedule }
  | { type: "DELETE_SCHEDULE"; id: string }
  | { type: "TOGGLE_SCHEDULE"; id: string }
  | { type: "END_SCHEDULE"; id: string };

export type MessageResponse = { ok: true } | { ok: false; error: string };

export function sendMessage(msg: Message): Promise<MessageResponse> {
  return chrome.runtime.sendMessage(msg);
}
