import type { ReactNode } from "react";

interface PeriodNavProps {
  label: string;
  isToday: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function PeriodNav({ label, isToday, onPrev, onNext, onToday }: PeriodNavProps): ReactNode {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onPrev}
          className="border-tunl-border bg-tunl-surface text-tunl-text-2 hover:bg-tunl-surface-h hover:border-tunl-border-h hover:text-tunl-text flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border text-base transition-all duration-150"
        >
          ‹
        </button>
        <span className="text-tunl-text min-w-[120px] text-center font-mono text-xs">{label}</span>
        <button
          onClick={onNext}
          disabled={isToday}
          className={`border-tunl-border bg-tunl-surface flex h-7 w-7 items-center justify-center rounded-lg border text-base transition-all duration-150 ${
            isToday
              ? "text-tunl-dim cursor-default opacity-40"
              : "text-tunl-text-2 hover:bg-tunl-surface-h hover:border-tunl-border-h hover:text-tunl-text cursor-pointer"
          }`}
        >
          ›
        </button>
      </div>
      {!isToday && (
        <button
          onClick={onToday}
          className="border-tunl-sage/20 text-tunl-sage hover:bg-tunl-sage-soft cursor-pointer rounded-md border bg-transparent px-2 py-0.5 text-[9px] font-semibold tracking-[0.8px] uppercase transition-all duration-150"
        >
          Today
        </button>
      )}
    </div>
  );
}
