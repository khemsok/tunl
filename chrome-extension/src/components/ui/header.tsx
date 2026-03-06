import type { ReactNode } from "react";

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps): ReactNode {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <div className="flex items-baseline gap-px">
        <span className="font-logo text-tunl-sage text-[15px] italic">tunl</span>
        <span className="text-tunl-dim text-[10px] font-semibold">.</span>
      </div>
      {children}
    </div>
  );
}
