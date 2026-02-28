import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import type { ArtTheme } from "../art/city";
import { COLORS } from "../theme";

const DESCRIPTIONS: Record<string, string> = {
  "City Skyline": "buildings rise, windows light up, moon glows, shooting stars streak across",
  "Forest": "trees grow, leaves shimmer, sun rises, birds fly, flowers bloom",
  "Space": "stars twinkle, planet forms, nebula swirls, rocket launches",
};

export function ThemePicker({
  themes,
  currentTheme,
  onSelect,
  onCancel,
}: {
  themes: ArtTheme[];
  currentTheme: string;
  onSelect: (theme: ArtTheme) => void;
  onCancel: () => void;
}) {
  const currentIdx = themes.findIndex((t) => t.name === currentTheme);
  const [cursor, setCursor] = useState(Math.max(0, currentIdx));

  useKeyboard((key) => {
    if (key.name === "up" || key.name === "k") {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.name === "down" || key.name === "j") {
      setCursor((c) => Math.min(themes.length - 1, c + 1));
    } else if (key.name === "return" || key.name === "space") {
      onSelect(themes[cursor]);
    } else if (key.name === "escape" || key.name === "q") {
      onCancel();
    }
  });

  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <text fg={COLORS.accent}>choose art theme</text>
      <box height={1} />
      <text fg={COLORS.textBody}>↑/↓ navigate · space select · esc cancel</text>
      <box height={2} />

      {themes.map((theme, i) => {
        const isCurrent = theme.name === currentTheme;
        const isCursor = i === cursor;
        const prefix = isCurrent ? "◉" : "○";
        const prefixColor = isCurrent ? COLORS.accent : COLORS.textMuted;
        const textColor = isCursor ? COLORS.white : COLORS.textBody;

        return (
          <box key={theme.name} flexDirection="column" alignItems="center">
            <text>
              <span fg={prefixColor}>{`  ${prefix} `}</span>
              <span fg={textColor}>{theme.name}</span>
              <span fg={COLORS.accent}>{isCursor ? " ◀" : ""}</span>
            </text>
            {isCursor && (
              <text fg={COLORS.textDim}>{"    " + (DESCRIPTIONS[theme.name] || "")}</text>
            )}
          </box>
        );
      })}
    </box>
  );
}
