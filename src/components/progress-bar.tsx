import { getGradientColor } from "../utils/colors";
import { COLORS } from "../theme";

type ProgressBarProps = {
  progress: number;
  width: number;
};

export function ProgressBar({ progress, width }: ProgressBarProps) {
  const barWidth = Math.max(width - 10, 20);
  const filledCount = Math.round(progress * barWidth);
  const emptyCount = barWidth - filledCount;
  const percent = Math.round(progress * 100);

  const barColor = getGradientColor(progress);
  const filled = "\u2501".repeat(filledCount);
  const empty = "\u2500".repeat(emptyCount);

  return (
    <box justifyContent="center" alignItems="center" width="100%">
      <text>
        <span fg={barColor}>{filled}</span>
        <span fg={COLORS.textDimmer}>{empty}</span>
        <span fg={COLORS.textMuted}>{` ${String(percent).padStart(3)}%`}</span>
      </text>
    </box>
  );
}
