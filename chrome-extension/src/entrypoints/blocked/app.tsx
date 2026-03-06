import { useState, useEffect, useMemo, type ReactNode } from "react";
import { QUOTES } from "@/lib/constants";
import { timerStorage, activeSchedulesStorage } from "@/lib/storage";
import { sendMessage } from "@/lib/messaging";
import { formatTime, getRemainingMs } from "@/lib/time-utils";
import type { TimerState, ActiveScheduleInfo } from "@/lib/types";

function getOrdinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const mod10 = n % 10;
  if (mod10 === 1) return `${n}st`;
  if (mod10 === 2) return `${n}nd`;
  if (mod10 === 3) return `${n}rd`;
  return `${n}th`;
}

function CoffeeIcon(): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      className="stroke-tunl-sage h-5 w-5 fill-none"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

export default function App(): ReactNode {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [activeSchedules, setActiveSchedules] = useState<ActiveScheduleInfo[]>([]);
  const [attempts] = useState(0);

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  useEffect(() => {
    void sendMessage({ type: "BLOCK_ATTEMPT" });
  }, []);

  useEffect(() => {
    void timerStorage.getValue().then(setTimer);
    const unwatch = timerStorage.watch(setTimer);
    return unwatch;
  }, []);

  useEffect(() => {
    void activeSchedulesStorage.getValue().then(setActiveSchedules);
    const unwatch = activeSchedulesStorage.watch(setActiveSchedules);
    return unwatch;
  }, []);

  const [, forceUpdate] = useState(0);
  const hasSchedule = activeSchedules.length > 0;
  const isTimerRunning = timer?.status === "running" || timer?.status === "paused";

  useEffect(() => {
    if (!timer || timer.status !== "running") return;
    const interval = setInterval(() => {
      void timerStorage.getValue().then(setTimer);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [timer?.status]);

  useEffect(() => {
    if (isTimerRunning || !hasSchedule) return;
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 60000);
    return () => {
      clearInterval(interval);
    };
  }, [isTimerRunning, hasSchedule]);

  const remaining = (() => {
    if (isTimerRunning) return formatTime(getRemainingMs(timer));
    if (hasSchedule) {
      const s = activeSchedules[0];
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const remainMin =
        s.endMin > currentMin ? s.endMin - currentMin : 1440 - currentMin + s.endMin;
      return `${remainMin}m`;
    }
    return "--:--";
  })();

  let remainingLabel = "remaining";
  if (!isTimerRunning && hasSchedule) remainingLabel = "until schedule ends";

  return (
    <div className="bg-tunl-bg-deep relative flex min-h-screen items-center justify-center overflow-hidden antialiased">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.018'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Orb */}
      <div
        className="animate-orb-pulse pointer-events-none absolute top-[35%] left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "radial-gradient(circle, rgba(122, 173, 122, 0.05) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div className="relative z-[1] flex max-w-[500px] flex-col items-center px-10 text-center">
        {/* Coffee icon */}
        <div className="bg-tunl-sage-soft border-tunl-sage-soft mb-7 flex h-12 w-12 items-center justify-center rounded-full border">
          <CoffeeIcon />
        </div>

        {/* Quote */}
        <p className="font-logo text-tunl-text mb-2 text-[22px] leading-[1.4] italic">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-tunl-muted mb-10 text-xs font-medium">&mdash; {quote.author}</p>

        {/* Divider */}
        <div
          className="mb-7 h-px w-7 opacity-25"
          style={{ background: "linear-gradient(90deg, transparent, #7aad7a, transparent)" }}
        />

        {/* Timer */}
        <div className="text-tunl-sage mb-1 font-mono text-4xl font-light tracking-[3px]">
          {remaining}
        </div>
        <div className="text-tunl-muted text-[9px] font-semibold tracking-[2.5px] uppercase">
          {remainingLabel}
        </div>

        {/* Schedule pill — only show when no manual timer */}
        {hasSchedule && !isTimerRunning && (
          <div className="bg-tunl-sage-soft border-tunl-sage-soft/80 mt-3.5 inline-flex items-center gap-1.5 rounded-[14px] border px-3.5 py-[5px]">
            <div className="bg-tunl-sage animate-pulse-dot h-[5px] w-[5px] rounded-full shadow-[0_0_6px_rgba(122,173,122,0.18)]" />
            <span className="text-tunl-sage font-mono text-[11px]">{activeSchedules[0].name}</span>
          </div>
        )}

        {/* Block attempts */}
        {attempts > 0 && (
          <p className="text-tunl-amber animate-fade-in-up mt-6 text-[11px] font-medium">
            This is your {getOrdinal(attempts)} attempt this session
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="font-logo text-tunl-dim fixed bottom-6 text-sm italic">tunl</div>
    </div>
  );
}
