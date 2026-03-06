export function clearBadge(): void {
  void chrome.action.setBadgeText({ text: "" });
}
