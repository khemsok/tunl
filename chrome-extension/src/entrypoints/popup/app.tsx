import { useState } from "react";
import { PopupShell } from "@/components/ui/popup-shell";
import type { NavTab } from "@/components/ui/bottom-nav";
import { TimerScreen } from "@/features/timer/_components/timer-screen";
import { DashboardScreen } from "@/features/dashboard/_components/dashboard-screen";
import { SchedulesScreen } from "@/features/schedules/_components/schedules-screen";
import { SettingsScreen } from "@/features/settings/_components/settings-screen";

const screens: Record<NavTab, () => React.ReactNode> = {
  timer: TimerScreen,
  stats: DashboardScreen,
  schedule: SchedulesScreen,
  settings: SettingsScreen,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("timer");
  const Screen = screens[activeTab];

  return (
    <PopupShell activeTab={activeTab} onTabChange={setActiveTab}>
      <Screen />
    </PopupShell>
  );
}
