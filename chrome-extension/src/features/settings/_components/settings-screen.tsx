import type { ReactNode } from "react";
import { DurationPicker } from "@/components/ui/duration-picker";
import { Toggle } from "@/components/ui/toggle";
import { useSettings } from "../_hooks/use-settings";
import { BlockedSites } from "./blocked-sites";

export function SettingsScreen(): ReactNode {
  const { duration, autoStart, setDuration, setAutoStart } = useSettings();

  return (
    <div className="flex flex-col gap-4 px-4 pt-2.5 pb-3">
      <div className="flex flex-col gap-2">
        <span className="text-tunl-text-2 text-[11px] font-semibold tracking-wider uppercase">
          Blocked Sites
        </span>
        <BlockedSites />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-tunl-text-2 text-[11px] font-semibold tracking-wider uppercase">
          Default Duration
        </span>
        <DurationPicker value={duration} onChange={setDuration} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-tunl-text text-[13px]">Auto-start next session</span>
        <Toggle checked={autoStart} onChange={setAutoStart} />
      </div>
    </div>
  );
}
