import type { ReactNode } from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import type { DashRange } from "../_lib/dashboard-utils";

const TABS: { value: DashRange; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

interface TabPickerProps {
  value: DashRange;
  onChange: (range: DashRange) => void;
}

export function TabPicker({ value, onChange }: TabPickerProps): ReactNode {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as DashRange);
      }}
      className="bg-tunl-surface border-tunl-border inline-flex gap-[3px] self-center rounded-[10px] border p-[3px]"
    >
      {TABS.map((tab) => (
        <ToggleGroup.Item
          key={tab.value}
          value={tab.value}
          className="text-tunl-muted hover:text-tunl-text-2 data-[state=on]:bg-tunl-sage data-[state=on]:text-tunl-bg-deep cursor-pointer rounded-[7px] border-none bg-transparent px-[18px] py-1.5 font-sans text-[11px] font-semibold tracking-[0.8px] uppercase transition-all duration-150"
        >
          {tab.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
