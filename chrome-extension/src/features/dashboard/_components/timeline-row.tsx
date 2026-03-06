import type { ReactNode } from "react";
import type { FocusSession } from "@/lib/types";
import { Pill } from "@/components/ui/pill";

interface TimelineRowProps {
  session: FocusSession;
  maxDuration: number;
}

export function TimelineRow({ session, maxDuration }: TimelineRowProps): ReactNode {
  const time = new Date(session.completedAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const barWidth = Math.max(8, (session.durationMin / maxDuration) * 100);
  const hasBlocks = session.blockAttempts > 0;

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5 py-1.5">
      <span className="text-tunl-muted font-mono text-[10px]">{time}</span>
      <div className="bg-tunl-surface h-1.5 overflow-hidden rounded-full">
        <div className="bg-tunl-sage h-full rounded-full" style={{ width: `${barWidth}%` }} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-tunl-text font-mono text-xs font-medium">{session.durationMin}m</span>
        {hasBlocks && (
          <span className="text-tunl-amber flex items-center gap-0.5 font-mono text-[10px] opacity-70" title="Blocked attempts">
            <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 fill-current">
              <path d="M8 1L2 4v4c0 3.5 2.6 6.8 6 7.5 3.4-.7 6-4 6-7.5V4L8 1z" />
            </svg>
            {session.blockAttempts}
          </span>
        )}
        {session.source === "schedule" && (
          <span className="text-tunl-sage bg-tunl-sage/10 rounded-full px-1.5 py-0.5 text-[8px] font-medium">
            sched
          </span>
        )}
      </div>
    </div>
  );
}
