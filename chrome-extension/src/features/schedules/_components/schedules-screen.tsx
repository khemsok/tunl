import { useState, type ReactNode } from "react";
import type { Schedule } from "@/lib/types";
import { useSchedules } from "../_hooks/use-schedules";
import { ScheduleList } from "./schedule-list";
import { ScheduleEditor } from "./schedule-editor";

type EditingState = Schedule | "new" | null;

export function SchedulesScreen(): ReactNode {
  const { schedules, isScheduleActive, isSessionActive, save, remove, toggle } = useSchedules();
  const [editing, setEditing] = useState<EditingState>(null);

  const handleSave = (schedule: Schedule) => {
    void save(schedule).then(() => {
      setEditing(null);
    });
  };

  if (editing !== null) {
    return (
      <ScheduleEditor
        schedule={editing === "new" ? undefined : editing}
        onSave={handleSave}
        onBack={() => {
          setEditing(null);
        }}
      />
    );
  }

  return (
    <ScheduleList
      schedules={schedules}
      isScheduleActive={isScheduleActive}
      isSessionActive={isSessionActive}
      onAdd={() => {
        setEditing("new");
      }}
      onEdit={(s) => {
        setEditing(s);
      }}
      onToggle={(id) => {
        void toggle(id);
      }}
      onDelete={(id) => {
        void remove(id);
      }}
    />
  );
}
