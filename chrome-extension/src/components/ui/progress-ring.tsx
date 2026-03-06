import type { ReactNode } from "react";

interface ProgressRingProps {
  progress: number;
  size: number;
  strokeWidth: number;
  variant?: "sage" | "rose";
  children?: ReactNode;
}

export function ProgressRing({
  progress,
  size,
  strokeWidth,
  variant = "sage",
  children,
}: ProgressRingProps): ReactNode {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
  const center = size / 2;

  const strokeColor = variant === "sage" ? "var(--color-tunl-sage)" : "var(--color-tunl-rose)";
  const glowColor = variant === "sage" ? "rgba(122,173,122,0.15)" : "rgba(176,112,112,0.15)";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-tunl-surface)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 6px ${glowColor})`,
            transition: "stroke-dashoffset 1s linear",
          }}
        />
      </svg>
      {children}
    </div>
  );
}
