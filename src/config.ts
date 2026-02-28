import { existsSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_PATH = join(homedir(), ".tunl.json");

export type TunlConfig = {
  duration: number;
  blockedSites: string[];
  theme: string;
  noblock: boolean;
  totalSessions: number;
  totalMinutesFocused: number;
  lastSessionDate: string;
  currentStreak: number;
};

export const DEFAULT_SITES = [
  "twitter.com",
  "x.com",
  "reddit.com",
  "youtube.com",
  "tiktok.com",
  "instagram.com",
  "facebook.com",
  "news.ycombinator.com",
];

const DEFAULTS: TunlConfig = {
  duration: 25,
  blockedSites: DEFAULT_SITES,
  theme: "city",
  noblock: false,
  totalSessions: 0,
  totalMinutesFocused: 0,
  lastSessionDate: "",
  currentStreak: 0,
};

export function loadConfig(): TunlConfig & { isFirstRun: boolean } {
  if (!existsSync(CONFIG_PATH)) {
    return { ...DEFAULTS, isFirstRun: true };
  }
  try {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    return { ...DEFAULTS, ...raw, isFirstRun: false };
  } catch {
    return { ...DEFAULTS, isFirstRun: true };
  }
}

export function saveConfig(config: Partial<TunlConfig>): void {
  const existing = existsSync(CONFIG_PATH)
    ? JSON.parse(readFileSync(CONFIG_PATH, "utf-8"))
    : {};
  writeFileSync(CONFIG_PATH, JSON.stringify({ ...existing, ...config }, null, 2));
}
