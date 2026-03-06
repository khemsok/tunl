import { useState, useEffect } from "react";
import { sessionsStorage } from "@/lib/storage";
import type { FocusSession } from "@/lib/types";

export function useSessions(): FocusSession[] {
  const [sessions, setSessions] = useState<FocusSession[]>([]);

  useEffect(() => {
    void sessionsStorage.getValue().then(setSessions);
    const unwatch = sessionsStorage.watch((value: FocusSession[] | null) => {
      setSessions(value ?? []);
    });
    return unwatch;
  }, []);

  return sessions;
}
