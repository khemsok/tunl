import type { ReactNode } from "react";

interface IconProps {
  children: ReactNode;
  size?: number;
  className?: string;
}

export function Icon({ children, size = 17, className = "" }: IconProps): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}
