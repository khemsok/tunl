import { useState, useCallback, type ReactNode } from "react";
import type { Schedule } from "@/lib/types";
import { blockedSitesStorage } from "@/lib/storage";
import { scheduleSchema } from "@/validations/schedule";
import { siteSchema } from "@/validations/site";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { DayPicker } from "./day-picker";
import { TimeRangeInput } from "./time-range-input";

interface ScheduleEditorProps {
  schedule?: Schedule;
  onSave: (schedule: Schedule) => void;
  onBack: () => void;
}

export function ScheduleEditor({ schedule, onSave, onBack }: ScheduleEditorProps): ReactNode {
  const isNew = !schedule;

  const [name, setName] = useState(schedule?.name ?? "");
  const [days, setDays] = useState<number[]>(schedule?.days ?? [1, 2, 3, 4, 5]);
  const [startMin, setStartMin] = useState(schedule?.startMin ?? 540);
  const [endMin, setEndMin] = useState(schedule?.endMin ?? 1020);
  const [blockedSites, setBlockedSites] = useState<string[]>(schedule?.blockedSites ?? []);
  const [siteInput, setSiteInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedDefaults, setHasLoadedDefaults] = useState(!!schedule);

  if (!hasLoadedDefaults && !schedule) {
    void blockedSitesStorage.getValue().then((defaults: string[]) => {
      setBlockedSites(defaults);
      setHasLoadedDefaults(true);
    });
  }

  const handleAddSite = useCallback(() => {
    const result = siteSchema.safeParse(siteInput);
    if (!result.success) return;
    if (blockedSites.includes(result.data)) return;
    setBlockedSites([...blockedSites, result.data]);
    setSiteInput("");
  }, [siteInput, blockedSites]);

  const handleRemoveSite = useCallback(
    (domain: string) => {
      setBlockedSites(blockedSites.filter((s) => s !== domain));
    },
    [blockedSites],
  );

  const handleSave = () => {
    const validation = scheduleSchema.safeParse({
      name: name.trim(),
      days,
      startMin,
      endMin,
      blockedSites,
    });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Invalid schedule");
      return;
    }

    onSave({
      id: schedule?.id ?? crypto.randomUUID(),
      name: name.trim(),
      days,
      startMin,
      endMin,
      blockedSites,
      enabled: schedule?.enabled ?? true,
    });
  };

  return (
    <div className="animate-fade-in-up flex flex-col gap-3.5 px-4 pt-2 pb-4">
      <button
        onClick={onBack}
        className="text-tunl-text-2 hover:text-tunl-text flex cursor-pointer items-center gap-1 self-start border-none bg-transparent p-0 text-[11px]"
      >
        <Icon size={12}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </Icon>
        Back
      </button>

      <h2 className="text-tunl-text m-0 text-[14px] font-semibold">
        {isNew ? "New Schedule" : "Edit Schedule"}
      </h2>

      <div className="flex flex-col gap-1">
        <label className="text-tunl-muted text-[9px] font-semibold tracking-[1px] uppercase">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder="e.g. Deep Work"
          maxLength={30}
          className="bg-tunl-surface border-tunl-border text-tunl-text placeholder:text-tunl-dim focus:border-tunl-sage/30 rounded-lg border px-3 py-2 text-[12px] outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-tunl-muted text-[9px] font-semibold tracking-[1px] uppercase">
          Days
        </label>
        <DayPicker selected={days} onChange={setDays} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-tunl-muted text-[9px] font-semibold tracking-[1px] uppercase">
          Time
        </label>
        <TimeRangeInput
          startMin={startMin}
          endMin={endMin}
          onStartChange={setStartMin}
          onEndChange={setEndMin}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-tunl-muted text-[9px] font-semibold tracking-[1px] uppercase">
          Block List
        </label>
        <div className="flex gap-1.5">
          <input
            value={siteInput}
            onChange={(e) => {
              setSiteInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSite();
            }}
            placeholder="Add domain..."
            className="bg-tunl-surface border-tunl-border text-tunl-text placeholder:text-tunl-dim focus:border-tunl-sage/30 flex-1 rounded-lg border px-3 py-2 text-[12px] outline-none"
          />
          <Button variant="sage" className="shrink-0 px-3 py-2 text-[11px]" onClick={handleAddSite}>
            +
          </Button>
        </div>
        {blockedSites.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {blockedSites.map((site) => (
              <span
                key={site}
                className="bg-tunl-surface border-tunl-border text-tunl-text-2 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px]"
              >
                {site}
                <button
                  onClick={() => {
                    handleRemoveSite(site);
                  }}
                  className="text-tunl-dim hover:text-tunl-rose cursor-pointer border-none bg-transparent p-0 text-[10px] leading-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-tunl-rose m-0 text-[11px]">{error}</p>}

      <div className="mt-1 flex gap-2">
        <Button variant="ghost" className="flex-1" onClick={onBack}>
          Cancel
        </Button>
        <Button variant="sage" className="flex-1" onClick={handleSave}>
          {isNew ? "Create" : "Save"}
        </Button>
      </div>
    </div>
  );
}
