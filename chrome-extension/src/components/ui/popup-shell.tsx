import type { ReactNode } from "react";
import { Header } from "./header";
import { BottomNav, type NavTab } from "./bottom-nav";
import { GrainOverlay } from "./grain-overlay";

interface PopupShellProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function PopupShell({
  activeTab,
  onTabChange,
  headerRight,
  children,
}: PopupShellProps): ReactNode {
  return (
    <div className="bg-tunl-bg text-tunl-text flex h-[580px] flex-col font-sans">
      <Header>{headerRight}</Header>
      <div className="flex-1 overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:w-0">
        {children}
      </div>
      <BottomNav active={activeTab} onChange={onTabChange} />
      <GrainOverlay />
    </div>
  );
}
