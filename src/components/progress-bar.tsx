// Gradient progress bar — periwinkle → seafoam → sage → gold → peach

function interpolateColor(
  color1: [number, number, number],
  color2: [number, number, number],
  t: number
): string {
  const r = Math.round(color1[0] + (color2[0] - color1[0]) * t);
  const g = Math.round(color1[1] + (color2[1] - color1[1]) * t);
  const b = Math.round(color1[2] + (color2[2] - color1[2]) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Multi-stop gradient: periwinkle → seafoam → sage → gold → peach
const STOPS: { at: number; color: [number, number, number] }[] = [
  { at: 0, color: [138, 173, 244] },    // #8AADF4 periwinkle
  { at: 0.25, color: [127, 219, 202] },  // #7FDBCA seafoam
  { at: 0.5, color: [166, 218, 149] },   // #A6DA95 sage
  { at: 0.75, color: [238, 212, 159] },  // #EED49F gold
  { at: 1, color: [245, 169, 127] },     // #F5A97F peach
];

function getGradientColor(progress: number): string {
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (progress <= STOPS[i + 1].at) {
      const t = (progress - STOPS[i].at) / (STOPS[i + 1].at - STOPS[i].at);
      return interpolateColor(STOPS[i].color, STOPS[i + 1].color, t);
    }
  }
  return interpolateColor(STOPS[STOPS.length - 2].color, STOPS[STOPS.length - 1].color, 1);
}

export function ProgressBar({
  progress,
  width,
}: {
  progress: number;
  width: number;
}) {
  const barWidth = Math.max(width - 10, 20);
  const filledCount = Math.round(progress * barWidth);
  const emptyCount = barWidth - filledCount;
  const percent = Math.round(progress * 100);

  const barColor = getGradientColor(progress);
  const filled = "━".repeat(filledCount);
  const empty = "─".repeat(emptyCount);

  return (
    <box justifyContent="center" alignItems="center" width="100%">
      <text>
        <span fg={barColor}>{filled}</span>
        <span fg="#585B70">{empty}</span>
        <span fg="#9399B2">{` ${String(percent).padStart(3)}%`}</span>
      </text>
    </box>
  );
}
