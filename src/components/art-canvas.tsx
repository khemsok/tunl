import type { ArtTheme } from "../art/city";
import { NUM_STAGES } from "../art/city";

// Art completes a full reveal cycle in ~5 minutes (375 ticks at 800ms each)
// Then stays at full. This is independent of the timer duration.
const FULL_CYCLE_TICKS = 375;

export function ArtCanvas({
  stage,
  theme,
  animTick,
}: {
  stage: number;
  theme: ArtTheme;
  animTick: number;
}) {
  // Art progress is driven by animTick, not by timer
  // Reaches 100% in ~5 minutes, then stays at full
  const tickProgress = Math.min(animTick / FULL_CYCLE_TICKS, 1);

  const artData = theme.generate
    ? theme.generate(tickProgress, animTick, 70)
    : theme.stages[Math.min(
        Math.floor(tickProgress * (NUM_STAGES - 1)),
        theme.stages.length - 1
      )];

  return (
    <box
      flexGrow={1}
      width="100%"
      alignItems="center"
      justifyContent="center"
    >
      <text>
        {artData.lines.map((artLine, i) => {
          const lineContent = artLine.segments.map((seg, j) => (
            <span key={j} fg={seg.fg}>
              {seg.text}
            </span>
          ));
          return (
            <span key={i}>
              {lineContent}
              {i < artData.lines.length - 1 ? "\n" : ""}
            </span>
          );
        })}
      </text>
    </box>
  );
}
