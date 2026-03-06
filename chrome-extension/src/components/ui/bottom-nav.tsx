import type { ReactNode } from "react";
import { Icon } from "./icon";

export type NavTab = "timer" | "stats" | "schedule" | "settings";

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const tabs: { id: NavTab; label: string; icon: ReactNode }[] = [
  {
    id: "timer",
    label: "Timer",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
  },
  {
    id: "stats",
    label: "Stats",
    icon: (
      <>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </>
    ),
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
  },
];

export function BottomNav({ active, onChange }: BottomNavProps): ReactNode {
  return (
    <div className="border-tunl-border bg-tunl-bg-deep flex border-t px-4 py-1.5 pb-2.5">
      {tabs.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => {
            onChange(id);
          }}
          className={`flex flex-1 cursor-pointer flex-col items-center gap-0.5 border-none bg-transparent py-1.5 font-sans transition-colors duration-150 ${
            active === id ? "text-tunl-sage" : "text-tunl-muted hover:text-tunl-text-2"
          }`}
        >
          <Icon>{icon}</Icon>
          <span className="text-[9px] font-semibold tracking-[0.6px] uppercase">{label}</span>
        </button>
      ))}
    </div>
  );
}
