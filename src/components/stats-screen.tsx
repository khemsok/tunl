import type { TunlConfig } from "../config";
import { formatMinutes } from "../utils/time";
import { COLORS } from "../theme";

type StatsScreenProps = {
  config: TunlConfig & { isFirstRun: boolean };
};

export function StatsScreen({ config }: StatsScreenProps) {
  const timeStr = formatMinutes(config.totalMinutesFocused);

  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <text fg={COLORS.accent}>focus stats</text>
      <box height={2} />
      <text fg={COLORS.text}>{"  sessions      " + config.totalSessions}</text>
      <text fg={COLORS.text}>{"  total focused  " + timeStr}</text>
      <text fg={COLORS.text}>{"  day streak     " + config.currentStreak}</text>
      <text fg={COLORS.text}>
        {"  last session   " + (config.lastSessionDate || "never")}
      </text>
      <box height={2} />
      <text fg={COLORS.textMuted}>esc to go back</text>
    </box>
  );
}
