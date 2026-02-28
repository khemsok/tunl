import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { DEFAULT_SITES } from "../config";
import { COLORS } from "../theme";

export function SiteEditor({
  currentSites,
  onSave,
  onCancel,
}: {
  currentSites: string[];
  onSave: (sites: string[]) => void;
  onCancel: () => void;
}) {
  const allSites = [...currentSites];

  const [enabled, setEnabled] = useState<Set<string>>(
    new Set(currentSites)
  );
  const [cursor, setCursor] = useState(0);
  const [inputMode, setInputMode] = useState(false);
  const [inputBuffer, setInputBuffer] = useState("");
  const [customSites, setCustomSites] = useState<string[]>(
    currentSites.filter((s) => !DEFAULT_SITES.includes(s))
  );

  const displaySites = [...allSites, ...customSites.filter((s) => !allSites.includes(s))];
  const totalRows = displaySites.length + 1;

  useKeyboard((key) => {
    if (inputMode) {
      if (key.name === "return") {
        const site = inputBuffer.trim().toLowerCase();
        if (site && /^[a-zA-Z0-9.-]+$/.test(site)) {
          if (!displaySites.includes(site)) {
            setCustomSites((prev) => [...prev, site]);
          }
          setEnabled((prev) => new Set([...prev, site]));
          setInputBuffer("");
          setInputMode(false);
        }
        return;
      }
      if (key.name === "escape") {
        setInputBuffer("");
        setInputMode(false);
        return;
      }
      if (key.name === "backspace") {
        setInputBuffer((prev) => prev.slice(0, -1));
        return;
      }
      if (key.name && key.name.length === 1 && !key.ctrl && !key.meta) {
        setInputBuffer((prev) => prev + key.name);
      }
      return;
    }

    if (key.name === "up" || key.name === "k") {
      setCursor((c) => Math.max(0, c - 1));
    } else if (key.name === "down" || key.name === "j") {
      setCursor((c) => Math.min(totalRows - 1, c + 1));
    } else if (key.name === "space") {
      if (cursor < displaySites.length) {
        const site = displaySites[cursor];
        setEnabled((prev) => {
          const next = new Set(prev);
          if (next.has(site)) next.delete(site);
          else next.add(site);
          return next;
        });
      } else {
        setInputMode(true);
      }
    } else if (key.name === "return") {
      onSave([...enabled]);
    } else if (key.name === "escape" || key.name === "q") {
      onCancel();
    }
  });

  const allDisplaySites = [...new Set([...displaySites])];

  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <text fg={COLORS.accent}>edit blocked sites</text>
      <box height={1} />
      <text fg={COLORS.textBody}>↑/↓ navigate · space toggle · enter save · esc cancel</text>
      <box height={1} />

      {allDisplaySites.map((site, i) => {
        const isEnabled = enabled.has(site);
        const isCursor = i === cursor;
        const prefix = isEnabled ? "✓" : "○";
        const prefixColor = isEnabled ? COLORS.success : COLORS.textMuted;
        const textColor = isCursor ? COLORS.white : COLORS.textBody;
        const indicator = isCursor ? " ◀" : "";

        return (
          <text key={site}>
            <span fg={prefixColor}>{`  ${prefix} `}</span>
            <span fg={textColor}>{site}</span>
            <span fg={COLORS.accent}>{indicator}</span>
          </text>
        );
      })}

      <text>
        <span fg={cursor === allDisplaySites.length ? COLORS.white : COLORS.textBody}>
          {"  + add new site"}
        </span>
        <span fg={COLORS.accent}>
          {cursor === allDisplaySites.length ? " ◀" : ""}
        </span>
      </text>

      {inputMode && (
        <>
          <box height={1} />
          <text>
            <span fg={COLORS.textBody}>{"  site: "}</span>
            <span fg={COLORS.white}>{inputBuffer}</span>
            <span fg={COLORS.accent}>{"_"}</span>
          </text>
        </>
      )}

      <box height={1} />
      <text fg={COLORS.textMuted}>
        {`${enabled.size} site${enabled.size !== 1 ? "s" : ""} selected`}
      </text>
    </box>
  );
}
