// Big ASCII digit font for the countdown timer
// Each digit is 5 lines tall, 4 chars wide using █▀▄ characters

const DIGITS: Record<string, string[]> = {
  "0": [
    "█▀▀█",
    "█  █",
    "█  █",
    "█  █",
    "█▄▄█",
  ],
  "1": [
    " ▄█ ",
    "  █ ",
    "  █ ",
    "  █ ",
    " ▄█▄",
  ],
  "2": [
    "█▀▀█",
    "   █",
    "█▀▀▀",
    "█   ",
    "█▄▄▄",
  ],
  "3": [
    "█▀▀█",
    "   █",
    " ▀▀█",
    "   █",
    "█▄▄█",
  ],
  "4": [
    "█  █",
    "█  █",
    "▀▀▀█",
    "   █",
    "   █",
  ],
  "5": [
    "█▀▀▀",
    "█   ",
    "▀▀▀█",
    "   █",
    "█▄▄█",
  ],
  "6": [
    "█▀▀▀",
    "█   ",
    "█▀▀█",
    "█  █",
    "█▄▄█",
  ],
  "7": [
    "█▀▀█",
    "   █",
    "   █",
    "  █ ",
    "  █ ",
  ],
  "8": [
    "█▀▀█",
    "█  █",
    "█▀▀█",
    "█  █",
    "█▄▄█",
  ],
  "9": [
    "█▀▀█",
    "█  █",
    "▀▀▀█",
    "   █",
    "█▄▄█",
  ],
  ":": [
    "    ",
    " ▀▀ ",
    "    ",
    " ▀▀ ",
    "    ",
  ],
};

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getTimerLines(seconds: number): string[] {
  const timeStr = formatTime(seconds);
  const lines: string[] = ["", "", "", "", ""];

  for (let i = 0; i < timeStr.length; i++) {
    const char = timeStr[i];
    const digitLines = DIGITS[char] || DIGITS["0"];
    for (let row = 0; row < 5; row++) {
      lines[row] += digitLines[row] + " ";
    }
  }

  return lines;
}

export function TimerDisplay({
  remaining,
  color,
  animTick,
}: {
  remaining: number;
  color?: string;
  animTick?: number;
}) {
  const timeStr = formatTime(remaining);
  const fg = color || "#E0F0FF";

  // Blinking colon — dim every other tick
  const colonVisible = animTick === undefined || animTick % 2 === 0;
  const colonLines = colonVisible ? DIGITS[":"] : ["    ", "    ", "    ", "    ", "    "];

  // Build lines manually to handle colon separately
  const lines: string[] = ["", "", "", "", ""];
  for (let i = 0; i < timeStr.length; i++) {
    const char = timeStr[i];
    const digitLines = char === ":" ? colonLines : (DIGITS[char] || DIGITS["0"]);
    for (let row = 0; row < 5; row++) {
      lines[row] += digitLines[row] + " ";
    }
  }

  return (
    <box justifyContent="center" alignItems="center" width="100%">
      <text fg={fg}>
        {lines.join("\n")}
      </text>
    </box>
  );
}
