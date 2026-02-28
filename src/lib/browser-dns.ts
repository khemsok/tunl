import { existsSync, writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";
import { homedir } from "os";
import { join } from "path";

const BROWSERS = [
  "com.google.Chrome",
  "com.google.Chrome.canary",
  "company.thebrowser.Browser", // Arc
  "com.microsoft.Edge",
  "com.brave.Browser",
  "com.vivaldi.Vivaldi",
  "com.operasoftware.Opera",
];

const DNS_SETUP_FLAG = join(homedir(), ".tunl-dns-setup");

/**
 * Disables browser built-in DNS so /etc/hosts blocking works.
 * Done once permanently (like SelfControl does).
 * Returns true if this was first-time setup (browser restart needed).
 */
export function setupBrowserDNS(): boolean {
  if (existsSync(DNS_SETUP_FLAG)) return false;

  for (const bundle of BROWSERS) {
    try {
      execSync(`defaults write ${bundle} BuiltInDnsClientEnabled -bool false 2>/dev/null`);
      execSync(`defaults write ${bundle} DnsOverHttpsMode -string "off" 2>/dev/null`);
    } catch {}
  }

  writeFileSync(DNS_SETUP_FLAG, new Date().toISOString());
  return true;
}

export function restoreBrowserDNS(): void {
  for (const bundle of BROWSERS) {
    try {
      execSync(`defaults delete ${bundle} BuiltInDnsClientEnabled 2>/dev/null`);
      execSync(`defaults delete ${bundle} DnsOverHttpsMode 2>/dev/null`);
    } catch {}
  }
  try { unlinkSync(DNS_SETUP_FLAG); } catch {}
}
