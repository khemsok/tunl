import type { ReactNode } from "react";

interface TimeRangeInputProps {
  startMin: number;
  endMin: number;
  onStartChange: (min: number) => void;
  onEndChange: (min: number) => void;
}

function minToTimeStr(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function parseTimeToMin(str: string): number {
  const [h, m] = str.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function TimeRangeInput({
  startMin,
  endMin,
  onStartChange,
  onEndChange,
}: TimeRangeInputProps): ReactNode {
  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={minToTimeStr(startMin)}
        onChange={(e) => {
          onStartChange(parseTimeToMin(e.target.value));
        }}
        className="bg-tunl-surface border-tunl-border text-tunl-text focus:border-tunl-sage/30 flex-1 rounded-lg border px-3 py-2 font-mono text-[12px] outline-none [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:invert"
      />
      <span className="text-tunl-dim text-[11px]">to</span>
      <input
        type="time"
        value={minToTimeStr(endMin)}
        onChange={(e) => {
          onEndChange(parseTimeToMin(e.target.value));
        }}
        className="bg-tunl-surface border-tunl-border text-tunl-text focus:border-tunl-sage/30 flex-1 rounded-lg border px-3 py-2 font-mono text-[12px] outline-none [&::-webkit-calendar-picker-indicator]:opacity-40 [&::-webkit-calendar-picker-indicator]:invert"
      />
    </div>
  );
}
