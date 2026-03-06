import { SCHEDULE_RULE_ID_BASE } from "@/lib/constants";

const BLOCKED_PAGE = "/blocked.html";

async function redirectBlockedTabs(sites: string[]): Promise<void> {
  if (sites.length === 0) return;
  const blockedUrl = chrome.runtime.getURL("blocked.html");
  const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
  for (const tab of tabs) {
    if (!tab.url || !tab.id) continue;
    if (tab.url.startsWith(blockedUrl)) continue;
    try {
      const hostname = new URL(tab.url).hostname.replace(/^www\./, "");
      if (sites.some((site) => hostname === site || hostname.endsWith(`.${site}`))) {
        await chrome.tabs.update(tab.id, { url: blockedUrl });
      }
    } catch {
      continue;
    }
  }
}

export async function enableBlocking(sites: string[]): Promise<void> {
  const rules = sites.map((domain, i) => ({
    id: i + 1,
    priority: 1,
    action: {
      type: "redirect" as chrome.declarativeNetRequest.RuleActionType,
      redirect: { extensionPath: BLOCKED_PAGE },
    },
    condition: {
      requestDomains: [domain],
      resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType],
    },
  }));

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const manualRuleIds = existing.filter((r) => r.id < SCHEDULE_RULE_ID_BASE).map((r) => r.id);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: manualRuleIds,
    addRules: rules,
  });
  await redirectBlockedTabs(sites);
}

export async function disableBlocking(): Promise<void> {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const manualRuleIds = existing.filter((r) => r.id < SCHEDULE_RULE_ID_BASE).map((r) => r.id);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: manualRuleIds,
  });
}

export async function enableScheduleBlocking(sites: string[]): Promise<void> {
  const rules = sites.map((domain, i) => ({
    id: SCHEDULE_RULE_ID_BASE + i,
    priority: 1,
    action: {
      type: "redirect" as chrome.declarativeNetRequest.RuleActionType,
      redirect: { extensionPath: BLOCKED_PAGE },
    },
    condition: {
      requestDomains: [domain],
      resourceTypes: ["main_frame" as chrome.declarativeNetRequest.ResourceType],
    },
  }));

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const scheduleRuleIds = existing.filter((r) => r.id >= SCHEDULE_RULE_ID_BASE).map((r) => r.id);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: scheduleRuleIds,
    addRules: rules,
  });
  await redirectBlockedTabs(sites);
}

export async function disableScheduleBlocking(): Promise<void> {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const scheduleRuleIds = existing.filter((r) => r.id >= SCHEDULE_RULE_ID_BASE).map((r) => r.id);
  if (scheduleRuleIds.length === 0) return;
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: scheduleRuleIds,
  });
}
