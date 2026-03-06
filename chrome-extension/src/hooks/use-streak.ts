import { useMemo } from "react";
import { getStreak } from "@/lib/session-utils";
import type { FocusSession } from "@/lib/types";

export function useStreak(sessions: FocusSession[]): number {
  return useMemo(() => getStreak(sessions), [sessions]);
}
