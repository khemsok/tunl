import { useState, useEffect, useCallback } from "react";
import { blockedSitesStorage, timerStorage } from "@/lib/storage";
import { siteSchema } from "@/validations/site";
import type { TimerState } from "@/lib/types";

interface UseBlockedSitesReturn {
  sites: string[];
  isLocked: boolean;
  isLoaded: boolean;
  add: (domain: string) => { ok: boolean; error?: string };
  remove: (domain: string) => void;
}

export function useBlockedSites(): UseBlockedSitesReturn {
  const [sites, setSites] = useState<string[]>([]);
  const [timerStatus, setTimerStatus] = useState<string | null>(null);

  useEffect(() => {
    void blockedSitesStorage.getValue().then(setSites);
    const unwatch = blockedSitesStorage.watch((v: string[] | null) => {
      if (v) setSites(v);
    });
    return unwatch;
  }, []);

  useEffect(() => {
    void timerStorage.getValue().then((t: TimerState) => { setTimerStatus(t.status); });
    const unwatch = timerStorage.watch((t: TimerState | null) => {
      if (t) setTimerStatus(t.status);
    });
    return unwatch;
  }, []);

  const isLoaded = timerStatus !== null;
  const isLocked = timerStatus === "running" || timerStatus === "paused";

  const add = useCallback(
    (raw: string): { ok: boolean; error?: string } => {
      const result = siteSchema.safeParse(raw);
      if (!result.success) return { ok: false, error: result.error.issues[0]?.message };

      const domain = result.data;
      if (sites.includes(domain)) return { ok: false, error: "Already added" };

      const updated = [...sites, domain];
      void blockedSitesStorage.setValue(updated);
      return { ok: true };
    },
    [sites],
  );

  const remove = useCallback(
    (domain: string) => {
      void blockedSitesStorage.setValue(sites.filter((s) => s !== domain));
    },
    [sites],
  );

  return { sites, isLocked, isLoaded, add, remove };
}
