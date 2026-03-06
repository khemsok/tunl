import type { ReactNode } from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { DURATION_PRESETS } from "@/lib/constants";

interface DurationPickerProps {
  value: number;
  onChange: (duration: number) => void;
}

export function DurationPicker({ value, onChange }: DurationPickerProps): ReactNode {
  return (
    <ToggleGroup.Root
      type="single"
      value={String(value)}
      onValueChange={(v) => {
        if (v) {
          onChange(Number(v));
        }
      }}
      className="bg-tunl-surface border-tunl-border inline-flex gap-0.5 rounded-[10px] border p-0.5"
    >
      {DURATION_PRESETS.map((d) => (
        <ToggleGroup.Item
          key={d}
          value={String(d)}
          className="text-tunl-muted hover:text-tunl-text-2 data-[state=on]:bg-tunl-sage data-[state=on]:text-tunl-bg-deep cursor-pointer rounded-[7px] border-none bg-transparent px-3.5 py-1.5 font-mono text-[11px] transition-all duration-150 data-[state=on]:font-medium"
        >
          {d}m
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
