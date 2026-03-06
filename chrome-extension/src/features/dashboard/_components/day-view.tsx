import type { ReactNode } from "react";
import type { FocusSession } from "@/lib/types";
import { formatHoursMins } from "@/lib/time-utils";
import { TimelineRow } from "./timeline-row";

interface DayViewProps {
  sessions: FocusSession[];
}

export function DayView({ sessions }: DayViewProps): ReactNode {
  if (sessions.length === 0) {
    return <div className="text-tunl-muted py-6 text-center text-sm">No sessions this day</div>;
  }

  const totalMins = sessions.reduce((sum, s) => sum + s.durationMin, 0);
  const sorted = [...sessions].sort((a, b) => b.completedAt - a.completedAt);
  const maxDuration = Math.max(...sessions.map((s) => s.durationMin), 1);

  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="text-tunl-sage font-mono text-2xl font-medium">
          {formatHoursMins(totalMins)}
        </span>
        <span className="text-tunl-text-2 font-mono text-xs">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="space-y-0.5">
        {sorted.map((s) => (
          <TimelineRow key={s.id} session={s} maxDuration={maxDuration} />
        ))}
      </div>
    </div>
  );
}
