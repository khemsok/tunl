import { useState, useMemo, useCallback } from "react";
import { useSessions } from "@/hooks/use-sessions";
import { getSessionsForRange } from "@/lib/session-utils";
import {
  type DashRange,
  getPeriodBounds,
  formatPeriodLabel,
  convertOffset,
} from "../_lib/dashboard-utils";

interface UseDashboardReturn {
  range: DashRange;
  offset: number;
  isToday: boolean;
  periodLabel: string;
  periodBounds: { start: Date; end: Date };
  periodSessions: ReturnType<typeof getSessionsForRange>;
  allSessions: ReturnType<typeof getSessionsForRange>;
  setRange: (newRange: DashRange) => void;
  prev: () => void;
  next: () => void;
  goToday: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [range, setRangeState] = useState<DashRange>("week");
  const [offset, setOffset] = useState(0);
  const allSessions = useSessions();

  const isToday = offset === 0;
  const periodBounds = useMemo(() => getPeriodBounds(range, offset), [range, offset]);
  const periodLabel = useMemo(() => formatPeriodLabel(range, offset), [range, offset]);
  const periodSessions = useMemo(
    () => getSessionsForRange(allSessions, periodBounds.start, periodBounds.end),
    [allSessions, periodBounds],
  );

  const setRange = useCallback(
    (newRange: DashRange) => {
      setOffset(convertOffset(range, newRange, offset));
      setRangeState(newRange);
    },
    [range, offset],
  );

  const prev = useCallback(() => {
    setOffset((o) => o - 1);
  }, []);
  const next = useCallback(() => {
    setOffset((o) => Math.min(0, o + 1));
  }, []);
  const goToday = useCallback(() => {
    setOffset(0);
  }, []);

  return {
    range,
    offset,
    isToday,
    periodLabel,
    periodBounds,
    periodSessions,
    allSessions,
    setRange,
    prev,
    next,
    goToday,
  };
}
