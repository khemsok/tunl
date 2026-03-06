import type { ReactNode } from "react";
import type { Schedule } from "@/lib/types";
import { SCHEDULE_MAX } from "@/lib/constants";
import { ScheduleCard } from "./schedule-card";
import { EmptyState } from "./empty-state";

interface ScheduleListProps {
  schedules: Schedule[];
  isScheduleActive: (id: string) => boolean;
  isSessionActive: boolean;
  onAdd: () => void;
  onEdit: (schedule: Schedule) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ScheduleList({
  schedules,
  isScheduleActive,
  isSessionActive,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
}: ScheduleListProps): ReactNode {
  return (
    <div className="flex flex-col gap-3 p-4">
      {schedules.length < SCHEDULE_MAX && (
        <button
          onClick={onAdd}
          className="border-tunl-border text-tunl-text-2 hover:border-tunl-border-h hover:text-tunl-text w-full cursor-pointer rounded-xl border-2 border-dashed bg-transparent py-3 text-[13px] transition-all"
        >
          + Add Schedule
        </button>
      )}

      {schedules.length === 0 ? (
        <EmptyState />
      ) : (
        schedules.map((s) => (
          <ScheduleCard
            key={s.id}
            schedule={s}
            isActive={isScheduleActive(s.id)}
            isSessionActive={isSessionActive}
            onEdit={() => {
              onEdit(s);
            }}
            onToggle={() => {
              onToggle(s.id);
            }}
            onDelete={() => {
              onDelete(s.id);
            }}
          />
        ))
      )}
    </div>
  );
}
