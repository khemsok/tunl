import { useState, type ReactNode } from "react";
import type { Schedule } from "@/lib/types";
import { DAY_LABELS } from "@/lib/constants";
import { formatMinFromMidnight } from "@/lib/time-utils";
import { Toggle } from "@/components/ui/toggle";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ScheduleCardProps {
  schedule: Schedule;
  isActive: boolean;
  isSessionActive: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

export function ScheduleCard({
  schedule,
  isActive,
  isSessionActive,
  onEdit,
  onToggle,
  onDelete,
}: ScheduleCardProps): ReactNode {
  const [showConfirm, setShowConfirm] = useState(false);
  const isLocked = isActive || (isSessionActive && schedule.enabled);
  const isEnabled = schedule.enabled;
  const isDisabledStyle = !isEnabled && !isActive;

  return (
    <>
      <div
        onClick={isLocked ? undefined : onEdit}
        className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
          isActive
            ? "border-tunl-sage/25 bg-[linear-gradient(135deg,rgba(122,173,122,0.06)_0%,var(--color-tunl-surface)_50%)]"
            : "bg-tunl-surface border-tunl-border"
        } ${isLocked ? "cursor-default" : "hover:border-tunl-border-h cursor-pointer"}`}
      >
        {isActive && (
          <div className="animate-pulse-dot bg-tunl-sage absolute top-0 left-0 h-full w-[2px]" />
        )}

        <div className="px-3.5 pt-3 pb-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`truncate text-[13px] leading-tight font-medium ${
                    isDisabledStyle ? "text-tunl-muted" : "text-tunl-text"
                  }`}
                >
                  {schedule.name}
                </span>
                {isActive && (
                  <span className="bg-tunl-sage/10 text-tunl-sage flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.8px] uppercase">
                    <span className="animate-pulse-dot bg-tunl-sage inline-block h-1 w-1 rounded-full" />
                    Live
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2.5">
                <span
                  className={`font-mono text-[11px] tracking-wide ${
                    isDisabledStyle ? "text-tunl-dim" : "text-tunl-text-2"
                  }`}
                >
                  {formatMinFromMidnight(schedule.startMin)}
                  <span className={isDisabledStyle ? "text-tunl-dim/50" : "text-tunl-muted"}>
                    {" "}
                    —{" "}
                  </span>
                  {formatMinFromMidnight(schedule.endMin)}
                </span>
              </div>
            </div>

            <div
              className="shrink-0 pt-0.5"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {isLocked ? (
                <div className="flex h-[18px] w-[34px] items-center justify-center">
                  <Icon size={13} className="text-tunl-amber/70">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </Icon>
                </div>
              ) : (
                <Toggle checked={isEnabled} onChange={onToggle} />
              )}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-between border-t px-3.5 py-2 ${
            isActive ? "border-tunl-sage/8 bg-tunl-sage/[0.03]" : "border-tunl-border/60"
          }`}
        >
          <div className="flex gap-[3px]">
            {DAY_LABELS.map((label, i) => {
              const isOn = schedule.days.includes(i);

              let dayStyle = "text-tunl-dim/30";
              if (isOn && isDisabledStyle) dayStyle = "bg-tunl-dim/20 text-tunl-dim";
              else if (isOn && isActive) dayStyle = "bg-tunl-sage/20 text-tunl-sage";
              else if (isOn) dayStyle = "bg-tunl-sage/12 text-tunl-sage/80";

              return (
                <span
                  key={i}
                  className={`flex h-[20px] w-[20px] items-center justify-center rounded-[5px] text-[9px] font-medium transition-colors ${dayStyle}`}
                >
                  {label}
                </span>
              );
            })}
          </div>

          {!isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              className="text-tunl-dim hover:text-tunl-rose hover:bg-tunl-rose-soft cursor-pointer rounded-md border-none bg-transparent p-1 transition-all duration-200"
            >
              <Icon size={12}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </Icon>
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={`Delete "${schedule.name}"?`}
        description="This schedule and its settings will be permanently removed."
        confirmLabel="Delete"
        onConfirm={onDelete}
      />
    </>
  );
}
