import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { LOGO, TAGLINE } from "../logo";
import { DEFAULT_SITES } from "../config";
import { COLORS } from "../theme";

export type OnboardingResult = {
  blockedSites: string[];
  duration: number;
};

export function Onboarding({
  onComplete,
}: {
  onComplete: (result: OnboardingResult) => void;
}) {
  const [step, setStep] = useState(0);
  const [duration, setDuration] = useState(25);

  useKeyboard((key) => {
    if (step === 0) {
      if (key.name === "space" || key.name === "return") {
        setStep(1);
      }
    } else if (step === 1) {
      if (key.name === "space" || key.name === "return") {
        setStep(2);
      }
    } else if (step === 2) {
      if (key.name === "up" || key.name === "=") {
        setDuration((d: number) => Math.min(d + 5, 120));
      } else if (key.name === "down" || key.name === "-") {
        setDuration((d: number) => Math.max(d - 5, 5));
      } else if (key.name === "space" || key.name === "return") {
        onComplete({
          blockedSites: DEFAULT_SITES,
          duration,
        });
      }
    }
  });

  if (step === 0) {
    return (
      <box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width="100%"
        height="100%"
      >
        <text fg={COLORS.accent}>{LOGO.join("\n")}</text>
        <box height={1} />
        <text fg={COLORS.textBody}>{TAGLINE}</text>
        <box height={2} />
        <text fg={COLORS.textMuted}>press space to begin setup</text>
      </box>
    );
  }

  if (step === 1) {
    return (
      <box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width="100%"
        height="100%"
      >
        <text fg={COLORS.accent}>sites to block during focus:</text>
        <box height={1} />
        {DEFAULT_SITES.map((site, i) => (
          <text key={i} fg={COLORS.warning}>
            {"  ✓ " + site}
          </text>
        ))}
        <box height={2} />
        <text fg={COLORS.textMuted}>press space to confirm · use --block to add more</text>
      </box>
    );
  }

  return (
    <box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width="100%"
      height="100%"
    >
      <text fg={COLORS.accent}>focus duration:</text>
      <box height={1} />
      <ascii-font text={String(duration)} font="block" color={COLORS.highlight} />
      <text fg={COLORS.textLabel}>minutes</text>
      <box height={2} />
      <text fg={COLORS.textMuted}>↑/↓ to adjust · space to start</text>
    </box>
  );
}
