export const ALARM_NAME = "tunl-timer";
export const BADGE_REFRESH_ALARM = "tunl-badge-refresh";
export const SCHEDULE_CHECK_ALARM = "tunl-schedule-check";
export const AUTO_START_ALARM = "tunl-auto-start";
export const SCHEDULE_RULE_ID_BASE = 10000;
export const SCHEDULE_MAX = 20;
export const END_CONFIRM_DURATION_MS = 5000;
export const WARMUP_DURATION_MS = 5 * 60 * 1000;

export const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;
export const DAY_FULL_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const DURATION_PRESETS = [15, 25, 45, 60] as const;

export const DEFAULT_BLOCKED_SITES = [
  "youtube.com",
  "x.com",
  "reddit.com",
  "instagram.com",
  "tiktok.com",
];

export const DEFAULT_SCHEDULES: import("./types").Schedule[] = [
  {
    id: "default-work",
    name: "Work Hours",
    days: [1, 2, 3, 4, 5],
    startMin: 9 * 60,
    endMin: 17 * 60,
    blockedSites: ["youtube.com", "x.com", "reddit.com", "instagram.com", "tiktok.com"],
    enabled: false,
  },
  {
    id: "default-morning",
    name: "Morning Routine",
    days: [0, 1, 2, 3, 4, 5, 6],
    startMin: 6 * 60,
    endMin: 9 * 60,
    blockedSites: ["youtube.com", "x.com", "reddit.com", "instagram.com", "tiktok.com"],
    enabled: false,
  },
  {
    id: "default-weekend",
    name: "Weekend Focus",
    days: [0, 6],
    startMin: 10 * 60,
    endMin: 14 * 60,
    blockedSites: ["youtube.com", "x.com", "reddit.com", "instagram.com", "tiktok.com"],
    enabled: false,
  },
];

export const QUOTES = [
  {
    text: "The successful warrior is the average man, with laser-like focus.",
    author: "Bruce Lee",
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
  },
  {
    text: "Concentrate all your thoughts upon the work at hand. The sun\u2019s rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
  },
  {
    text: "The secret of change is to focus all your energy not on fighting the old, but on building the new.",
    author: "Socrates",
  },
  { text: "Where focus goes, energy flows.", author: "Tony Robbins" },
  { text: "You can always find a distraction if you\u2019re looking for one.", author: "Tom Kite" },
  { text: "Starve your distractions, feed your focus.", author: "Daniel Goleman" },
  { text: "The main thing is to keep the main thing the main thing.", author: "Stephen Covey" },
  {
    text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    author: "Buddha",
  },
  { text: "The ability to concentrate and to use time well is everything.", author: "Lee Iacocca" },
];
