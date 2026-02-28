import type { ArtTheme } from "../art/city";
import { NUM_STAGES } from "../art/city";

export function ArtCanvas({
  stage,
  theme,
  animTick,
}: {
  stage: number;
  theme: ArtTheme;
  animTick: number;
}) {
  // Use procedural generation if available — live animated art
  const progress = stage / Math.max(NUM_STAGES - 1, 1);
  const artData = theme.generate
    ? theme.generate(progress, animTick, 70)
    : theme.stages[Math.min(stage, theme.stages.length - 1)];

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
