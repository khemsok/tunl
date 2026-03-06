import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DurationPicker } from "@/components/ui/duration-picker";
import { sendMessage } from "@/lib/messaging";
import { activeSchedulesStorage, defaultDurationStorage } from "@/lib/storage";
import { formatMinFromMidnight } from "@/lib/time-utils";
import { END_CONFIRM_DURATION_MS } from "@/lib/constants";
import type { ActiveScheduleInfo } from "@/lib/types";
import { StatsRow } from "./stats-row";
import { UpcomingCard } from "./upcoming-card";

export function TimerIdle(): ReactNode {
  const [duration, setDuration] = useState(25);
  const [activeSchedules, setActiveSchedules] = useState<ActiveScheduleInfo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [endStartedAt, setEndStartedAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [endComplete, setEndComplete] = useState(false);
  const [barWidth, setBarWidth] = useState(100);
  const [confirmInput, setConfirmInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    void defaultDurationStorage.getValue().then((v: number | null) => {
      if (v) setDuration(v);
    });
  }, []);

  useEffect(() => {
    void activeSchedulesStorage.getValue().then((v) => {
      setActiveSchedules(v);
      setIsLoaded(true);
    });
    const unwatch = activeSchedulesStorage.watch(setActiveSchedules);
    return unwatch;
  }, []);

  const startEndCountdown = useCallback(() => {
    setIsEnding(true);
    setEndStartedAt(Date.now());
    setEndComplete(false);
    setCountdown(5);
    setBarWidth(100);
  }, []);

  const cancelEndCountdown = useCallback(() => {
    setIsEnding(false);
    setEndStartedAt(null);
    setCountdown(5);
    setEndComplete(false);
    setBarWidth(100);
    setConfirmInput("");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (!endStartedAt) return;
    const tick = () => {
      const elapsed = Date.now() - endStartedAt;
      const remaining = Math.max(0, END_CONFIRM_DURATION_MS - elapsed);
      const pct = (remaining / END_CONFIRM_DURATION_MS) * 100;
      setBarWidth(pct);
      setCountdown(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        setEndComplete(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [endStartedAt]);

  if (!isLoaded) return null;

  if (activeSchedules.length > 0) {
    const activeSchedule = activeSchedules[0];
    const handleConfirmEnd = () => {
      void sendMessage({ type: "END_SCHEDULE", id: activeSchedule.id });
      cancelEndCountdown();
    };

    return (
      <div className="flex flex-1 flex-col items-center">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          {isEnding ? (
            <div className="flex w-full max-w-[240px] flex-col items-center gap-5">
              {!endComplete ? (
                <>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-tunl-rose font-mono text-[36px] leading-none font-light">
                      {countdown}
                    </div>
                    <div className="text-tunl-rose/60 text-[9px] font-semibold tracking-[1.6px] uppercase">
                      Wait to confirm
                    </div>
                  </div>
                  <div className="bg-tunl-surface h-[3px] w-full overflow-hidden rounded-full">
                    <div
                      className="bg-tunl-rose h-full rounded-full transition-none"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex w-full flex-col items-center gap-3">
                  <div className="text-tunl-rose/60 text-[9px] font-semibold tracking-[1.6px] uppercase">
                    Type &ldquo;end&rdquo; to confirm
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={confirmInput}
                    onChange={(e) => {
                      setConfirmInput(e.target.value.toLowerCase());
                    }}
                    placeholder="end"
                    spellCheck={false}
                    autoComplete="off"
                    className="bg-tunl-surface border-tunl-border text-tunl-rose placeholder:text-tunl-dim focus:border-tunl-rose/40 w-full rounded-lg border px-3 py-2 text-center font-mono text-[15px] tracking-widest outline-none"
                  />
                </div>
              )}

              <div className="flex w-full gap-2">
                <Button variant="ghost" className="flex-1" onClick={cancelEndCountdown}>
                  Cancel
                </Button>
                <Button
                  variant="rose-outline"
                  className="flex-1"
                  disabled={confirmInput !== "end"}
                  onClick={handleConfirmEnd}
                >
                  End
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-tunl-sage-soft flex h-12 w-12 items-center justify-center rounded-full">
                <span className="bg-tunl-sage animate-pulse-dot h-2 w-2 rounded-full" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-tunl-muted text-[9px] font-semibold tracking-[1.6px] uppercase">
                  Schedule Active
                </div>
                <div className="text-tunl-sage text-[15px] font-medium">{activeSchedule.name}</div>
              </div>
              <div className="text-tunl-text-2 font-mono text-[12px]">
                Sites blocked until {formatMinFromMidnight(activeSchedule.endMin)}
              </div>
              <div className="mt-1">
                <Button variant="rose-outline" onClick={startEndCountdown}>
                  End Schedule
                </Button>
              </div>
            </>
          )}
        </div>
        <StatsRow />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-1 pt-6">
        <div className="text-tunl-text font-mono text-[42px] leading-none font-light tracking-tight">
          {duration}
          <span className="text-tunl-dim animate-blink-colon">:</span>
          00
        </div>
        <div className="text-tunl-muted mt-1 mb-4 text-[9px] font-semibold tracking-[1.6px] uppercase">
          Set Duration
        </div>
        <DurationPicker value={duration} onChange={setDuration} />
        <div className="mt-4 w-full max-w-[200px]">
          <Button
            variant="amber"
            className="w-full"
            onClick={() => {
              void sendMessage({ type: "START_TIMER", durationMs: duration * 60000 });
            }}
          >
            Start Focus
          </Button>
        </div>
        <UpcomingCard />
      </div>
      <StatsRow />
    </div>
  );
}
