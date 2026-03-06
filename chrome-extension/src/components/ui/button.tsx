import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "amber" | "sage" | "ghost" | "rose-outline" | "locked";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  amber:
    "bg-tunl-amber text-tunl-bg-deep px-5 py-2.5 hover:-translate-y-px hover:shadow-[0_6px_20px_var(--color-tunl-amber-glow)]",
  sage: "bg-tunl-sage text-tunl-bg-deep px-5 py-2.5 hover:-translate-y-px hover:shadow-[0_6px_20px_var(--color-tunl-sage-glow)]",
  ghost:
    "bg-tunl-surface text-tunl-text-2 border border-tunl-border px-4 py-2 hover:bg-tunl-surface-h hover:border-tunl-border-h",
  "rose-outline":
    "bg-tunl-rose-soft text-tunl-rose border border-[rgba(176,112,112,0.08)] px-4 py-2 hover:bg-[rgba(176,112,112,0.14)]",
  locked:
    "bg-tunl-surface text-tunl-text-2 border border-tunl-border px-4 py-2 opacity-40 cursor-not-allowed",
};

export function Button({
  variant,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps): ReactNode {
  const isLocked = variant === "locked";

  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border-none font-sans text-[12px] font-semibold transition-all duration-200 ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLocked}
      {...props}
    >
      {children}
    </button>
  );
}
