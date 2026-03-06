import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

export function EmptyState(): ReactNode {
  return (
    <div className="text-tunl-muted flex flex-col items-center justify-center gap-3 py-12">
      <Icon size={32} className="text-tunl-dim">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </Icon>
      <span className="text-[13px]">No schedules yet</span>
    </div>
  );
}
