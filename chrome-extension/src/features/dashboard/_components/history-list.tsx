import { useState, type ReactNode } from "react";
import type { FocusSession } from "@/lib/types";
import { formatHoursMins } from "@/lib/time-utils";
import { groupSessionsByDayList } from "../_lib/dashboard-utils";
import { TimelineRow } from "./timeline-row";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface HistoryListProps {
  sessions: FocusSession[];
}

export function HistoryList({ sessions }: HistoryListProps): ReactNode {
  const [expandedIdx, setExpandedIdx] = useState<Set<number>>(new Set());

  if (sessions.length === 0) return null;

  const groups = groupSessionsByDayList(sessions).slice(0, 14);

  const toggleGroup = (idx: number) => {
    setExpandedIdx((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div>
      <h4 className="text-tunl-muted mb-2.5 text-[11px] font-semibold uppercase tracking-wider">
        Sessions
      </h4>
      <div className="space-y-1">
        {groups.map((g, i) => {
          const isExpanded = expandedIdx.has(i);
          const maxDuration = Math.max(...g.sessions.map((s) => s.durationMin), 1);

          return (
            <div key={g.dateStr}>
              <button
                onClick={() => {
                  toggleGroup(i);
                }}
                className="bg-tunl-surface border-tunl-border flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 transition-colors duration-100"
              >
                <span className="text-tunl-text text-[13px] font-semibold">
                  {DAY_NAMES[g.date.getDay()]}, {MONTH_NAMES[g.date.getMonth()]} {g.date.getDate()}
                </span>
                <span className="text-tunl-muted font-mono text-[11px]">
                  {formatHoursMins(g.totalMins)} · {g.sessions.length} session{g.sessions.length !== 1 ? "s" : ""} {isExpanded ? "˄" : "˅"}
                </span>
              </button>
              {isExpanded && (
                <div className="animate-fade-in-up px-3 py-1.5">
                  {g.sessions.map((s) => (
                    <TimelineRow key={s.id} session={s} maxDuration={maxDuration} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
