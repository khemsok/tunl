import { formatTime } from "../utils/time";
import { COLORS } from "../theme";

const DIGITS: Record<string, string[]> = {
  "0": ["┌─┐", "│ │", "└─┘"],
  "1": [" ─┐", "  │", " ─┘"],
  "2": ["┌─┐", "┌─┘", "└─ "],
  "3": ["┌─┐", " ─┤", "└─┘"],
  "4": ["│ │", "└─┤", "  │"],
  "5": ["┌─ ", "└─┐", "──┘"],
  "6": ["┌─ ", "├─┐", "└─┘"],
  "7": ["──┐", "  │", "  │"],
  "8": ["┌─┐", "├─┤", "└─┘"],
  "9": ["┌─┐", "└─┤", "  │"],
  ":": ["   ", " · ", " · "],
};

function getTimerLines(seconds: number): string[] {
  const timeStr = formatTime(seconds);
  const lines: string[] = ["", "", ""];

  for (let i = 0; i < timeStr.length; i++) {
    const char = timeStr[i];
    const digitLines = DIGITS[char] || DIGITS["0"];
    for (let row = 0; row < 3; row++) {
      lines[row] += digitLines[row] + " ";
    }
  }

  return lines;
}

type TimerDisplayProps = {
  remaining: number;
  color?: string;
};

export function TimerDisplay({ remaining, color }: TimerDisplayProps) {
  const timerLines = getTimerLines(remaining);
  const fg = color || COLORS.text;

  return (
    <box justifyContent="center" alignItems="center" width="100%">
      <text fg={fg}>{timerLines.join("\n")}</text>
    </box>
  );
}
