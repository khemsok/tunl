import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { sendMessage } from "@/lib/messaging";
import { StatsRow } from "./stats-row";

interface TimerCompletedProps {
  durationMs: number;
}

export function TimerCompleted({ durationMs }: TimerCompletedProps): ReactNode {
  const durationMin = Math.round(durationMs / 60000);

  const handleStartAnother = () => {
    void sendMessage({ type: "START_TIMER", durationMs });
  };

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="animate-pop-in bg-tunl-sage-soft flex h-12 w-12 items-center justify-center rounded-full">
          <Icon size={22} className="text-tunl-sage">
            <polyline points="6 12 10 16 18 8" />
          </Icon>
        </div>
        <div className="text-center">
          <h2 className="text-tunl-text m-0 text-[15px] font-semibold">Session Complete</h2>
          <p className="text-tunl-text-2 m-0 mt-1 text-[12px]">
            {durationMin} minute{durationMin !== 1 ? "s" : ""} of deep focus
          </p>
        </div>
        <div className="w-full max-w-[180px]">
          <Button variant="amber" className="w-full" onClick={handleStartAnother}>
            Start Another
          </Button>
        </div>
      </div>
      <StatsRow />
    </div>
  );
}
