import type { ReactNode } from "react";

interface StatCardProps {
  value: string;
  label: string;
}

export function StatCard({ value, label }: StatCardProps): ReactNode {
  return (
    <div className="bg-tunl-surface border-tunl-border hover:border-tunl-border-h rounded-lg border px-2 py-2.5 text-center transition-colors duration-150">
      <div className="text-tunl-sage font-mono text-[13px] leading-none font-medium">{value}</div>
      <div className="text-tunl-muted mt-1 text-[7px] font-semibold tracking-[1px] uppercase">
        {label}
      </div>
    </div>
  );
}
