import { loadConfig, saveConfig } from "../config";

export function recordSession(durationMinutes: number): void {
  const config = loadConfig();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let streak = config.currentStreak;
  if (config.lastSessionDate === today) {
    // streak stays
  } else if (config.lastSessionDate === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }

  saveConfig({
    totalSessions: config.totalSessions + 1,
    totalMinutesFocused: config.totalMinutesFocused + durationMinutes,
    lastSessionDate: today,
    currentStreak: streak,
  });
}
