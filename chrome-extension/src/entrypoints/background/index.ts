import {
  ALARM_NAME,
  SCHEDULE_CHECK_ALARM,
  AUTO_START_ALARM,
} from "@/lib/constants";
import {
  timerStorage,
  blockedSitesStorage,
  activeSchedulesStorage,
  schedulesStorage,
} from "@/lib/storage";
import type { Message } from "@/lib/messaging";
import { startTimer, completeTimer } from "./timer";
import { enableBlocking } from "./blocking";

import { evaluateSchedules } from "./schedules";
import { handleMessage } from "./messages";

function isDomainBlocked(hostname: string, sites: string[]): boolean {
  return sites.some((d) => hostname === d || hostname.endsWith("." + d));
}

async function recoverState(): Promise<void> {
  const timer = await timerStorage.getValue();

  if (timer.status === "running" && timer.startedAt) {
    const elapsed = Date.now() - timer.startedAt;
    if (elapsed >= timer.remainingMs) {
      await completeTimer();
    } else {
      const sites = await blockedSitesStorage.getValue();
      await enableBlocking(sites);
    }
  } else if (timer.status === "paused") {
    const sites = await blockedSitesStorage.getValue();
    await enableBlocking(sites);
  }

  void chrome.alarms.create(SCHEDULE_CHECK_ALARM, { periodInMinutes: 0.5 });
  await evaluateSchedules();
}

async function checkAndBlockTab(tabId: number, url: string): Promise<void> {
  if (url.startsWith("chrome") || url.startsWith("chrome-extension")) return;

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return;
  }

  const timer = await timerStorage.getValue();
  const activeSchedules = await activeSchedulesStorage.getValue();
  const isSessionActive = timer.status === "running" || timer.status === "paused";
  const isScheduleActive = activeSchedules.length > 0;

  if (!isSessionActive && !isScheduleActive) return;

  if (isSessionActive) {
    const sites = await blockedSitesStorage.getValue();
    if (isDomainBlocked(hostname, sites)) {
      void chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html") });
      return;
    }
  }

  if (isScheduleActive) {
    const schedules = await schedulesStorage.getValue();
    const activeIds = new Set(activeSchedules.map((s) => s.id));
    const scheduleSites = schedules
      .filter((s) => activeIds.has(s.id))
      .flatMap((s) => s.blockedSites);
    if (isDomainBlocked(hostname, scheduleSites)) {
      void chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html") });
    }
  }
}

async function handleAlarm(alarm: chrome.alarms.Alarm): Promise<void> {
  if (alarm.name === ALARM_NAME) {
    await completeTimer();
  } else if (alarm.name === SCHEDULE_CHECK_ALARM) {
    await evaluateSchedules();
  } else if (alarm.name === AUTO_START_ALARM) {
    const timer = await timerStorage.getValue();
    await startTimer(timer.durationMs);
  }
}

export default defineBackground(() => {
  chrome.alarms.onAlarm.addListener((alarm) => {
    void handleAlarm(alarm);
  });

  chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
    void handleMessage(msg).then(sendResponse);
    return true;
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    const info = changeInfo as Record<string, unknown>;
    const url = (info.pendingUrl as string | undefined) ?? (info.url as string | undefined);
    if (url) void checkAndBlockTab(tabId, url);
  });

  chrome.tabs.onActivated.addListener((activeInfo) => {
    void chrome.tabs.get(activeInfo.tabId).then((tab) => {
      if (tab.url) void checkAndBlockTab(activeInfo.tabId, tab.url);
    });
  });

  chrome.runtime.onStartup.addListener(() => {
    void recoverState();
  });
  void recoverState();
});
