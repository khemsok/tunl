import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { DEFAULT_SITES } from "../config";

export function SiteEditor({
  currentSites,
  onSave,
  onCancel,
}: {
  currentSites: string[];
  onSave: (sites: string[]) => void;
  onCancel: () => void;
}) {
  // Show current sites only — defaults are only used on first onboarding
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
  // +1 for the "add new site" row
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
      // Regular character input
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
        // "Add new" row
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
      <text fg="#7FDBCA">edit blocked sites</text>
      <box height={1} />
      <text fg="#B8C0E0">↑/↓ navigate · space toggle · enter save · esc cancel</text>
      <box height={1} />

      {allDisplaySites.map((site, i) => {
        const isEnabled = enabled.has(site);
        const isCursor = i === cursor;
        const prefix = isEnabled ? "✓" : "○";
        const prefixColor = isEnabled ? "#A6DA95" : "#9399B2";
        const textColor = isCursor ? "#FFFFFF" : "#B8C0E0";
        const indicator = isCursor ? " ◀" : "";

        return (
          <text key={site}>
            <span fg={prefixColor}>{`  ${prefix} `}</span>
            <span fg={textColor}>{site}</span>
            <span fg="#7FDBCA">{indicator}</span>
          </text>
        );
      })}

      {/* Add new site row */}
      <text>
        <span fg={cursor === allDisplaySites.length ? "#FFFFFF" : "#B8C0E0"}>
          {"  + add new site"}
        </span>
        <span fg="#7FDBCA">
          {cursor === allDisplaySites.length ? " ◀" : ""}
        </span>
      </text>

      {inputMode && (
        <>
          <box height={1} />
          <text>
            <span fg="#B8C0E0">{"  site: "}</span>
            <span fg="#FFFFFF">{inputBuffer}</span>
            <span fg="#7FDBCA">{"_"}</span>
          </text>
        </>
      )}

      <box height={1} />
      <text fg="#9399B2">
        {`${enabled.size} site${enabled.size !== 1 ? "s" : ""} selected`}
      </text>
    </box>
  );
}
