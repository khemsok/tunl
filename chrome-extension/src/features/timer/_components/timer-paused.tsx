import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ProgressRing } from "@/components/ui/progress-ring";
import { sendMessage } from "@/lib/messaging";
import { formatTime } from "@/lib/time-utils";
import { StatsRow } from "./stats-row";

interface TimerPausedProps {
  remainingMs: number;
  progress: number;
}

export function TimerPaused({ remainingMs, progress }: TimerPausedProps): ReactNode {
  const formatted = formatTime(remainingMs);
  const [mins, secs] = formatted.split(":");

  const handleResume = () => {
    void sendMessage({ type: "RESUME_TIMER" });
  };

  const handleEnd = () => {
    void sendMessage({ type: "REQUEST_END" });
  };

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="animate-breathe">
          <ProgressRing progress={progress} size={140} strokeWidth={3} variant="rose">
            <div className="flex flex-col items-center justify-center">
              <div className="text-tunl-text font-mono text-[32px] leading-none font-light tracking-tight">
                {mins}
                <span className="text-tunl-dim">:</span>
                {secs}
              </div>
            </div>
          </ProgressRing>
        </div>

        <div className="text-tunl-rose text-[9px] font-semibold tracking-[1.6px] uppercase">
          Paused
        </div>

        <div className="mt-2 flex gap-3">
          <Button variant="sage" onClick={handleResume}>
            <Icon size={12}>
              <polygon points="6,4 20,12 6,20" fill="currentColor" />
            </Icon>
            Resume
          </Button>
          <Button variant="rose-outline" onClick={handleEnd}>
            End Session
          </Button>
        </div>
      </div>
      <StatsRow />
    </div>
  );
}
