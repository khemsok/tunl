import type { ReactNode } from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { DAY_LABELS } from "@/lib/constants";

interface DayPickerProps {
  selected: number[];
  onChange: (days: number[]) => void;
}

export function DayPicker({ selected, onChange }: DayPickerProps): ReactNode {
  return (
    <ToggleGroup.Root
      type="multiple"
      value={selected.map(String)}
      onValueChange={(values) => {
        onChange(values.map(Number).sort());
      }}
      className="flex gap-1.5"
    >
      {DAY_LABELS.map((label, i) => (
        <ToggleGroup.Item
          key={i}
          value={String(i)}
          className="bg-tunl-surface text-tunl-muted hover:text-tunl-text-2 data-[state=on]:bg-tunl-sage data-[state=on]:text-tunl-bg-deep h-8 w-8 cursor-pointer rounded-full border-none text-[11px] font-semibold transition-all duration-150"
        >
          {label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
