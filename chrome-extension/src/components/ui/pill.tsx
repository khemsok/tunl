import type { ReactNode } from "react";

type PillVariant = "amber" | "sage" | "rose";

interface PillProps {
  variant: PillVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<PillVariant, string> = {
  amber: "bg-tunl-amber-soft border-[rgba(196,160,92,0.10)] text-tunl-amber",
  sage: "bg-tunl-sage-soft border-[rgba(122,173,122,0.08)] text-tunl-sage",
  rose: "bg-tunl-rose-soft border-[rgba(176,112,112,0.08)] text-tunl-rose",
};

export function Pill({ variant, children, className = "" }: PillProps): ReactNode {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
