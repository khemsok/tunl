import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";
import { homedir } from "os";
import { join } from "path";

const HOSTS_PATH = "/etc/hosts";
const START_MARKER = "# --- tunl start ---";
const END_MARKER = "# --- tunl end ---";
const PID_PATH = join(homedir(), ".tunl.pid");

function validateSite(site: string): boolean {
  return /^[a-zA-Z0-9.-]+$/.test(site);
}

// -- /etc/hosts management --

function blockHosts(sites: string[]): void {
  unblockHosts();

  const entries = sites
    .flatMap((s) => [
      `0.0.0.0 ${s}`,
      `0.0.0.0 www.${s}`,
      `:: ${s}`,
      `:: www.${s}`,
    ])
    .join("\n");

  const currentHosts = readFileSync(HOSTS_PATH, "utf-8").trimEnd();
  const block = `${currentHosts}\n${START_MARKER}\n${entries}\n${END_MARKER}\n`;

  const tmpPath = join(homedir(), ".tunl-block.tmp");
  writeFileSync(tmpPath, block);
  execSync(`sudo cp "${tmpPath}" ${HOSTS_PATH}`);
  unlinkSync(tmpPath);
}

function unblockHosts(): void {
  try {
    const hosts = readFileSync(HOSTS_PATH, "utf-8");
    const startIdx = hosts.indexOf(START_MARKER);
    const endIdx = hosts.indexOf(END_MARKER);
    if (startIdx === -1 || endIdx === -1) return;

    const cleaned = (
      hosts.slice(0, startIdx) + hosts.slice(endIdx + END_MARKER.length)
    ).trimEnd() + "\n";

    const tmpPath = join(homedir(), ".tunl-hosts.tmp");
    writeFileSync(tmpPath, cleaned);
    execSync(`sudo cp "${tmpPath}" ${HOSTS_PATH}`);
    unlinkSync(tmpPath);
  } catch {}
}

// -- DNS cache flushing --

function flushDNS(): void {
  try { execSync("sudo dscacheutil -flushcache 2>/dev/null"); } catch {}
  try { execSync("sudo killall -HUP mDNSResponder 2>/dev/null"); } catch {}
  try { execSync("sudo killall mDNSResponderHelper 2>/dev/null"); } catch {}
}

// -- Public API --

export function blockSites(sites: string[]): void {
  cleanupStaleBlocks();

  const validSites = sites.filter(validateSite);
  if (validSites.length === 0) return;

  writeFileSync(PID_PATH, String(process.pid));
  blockHosts(validSites);
  flushDNS();
}

export function unblockSites(): void {
  unblockHosts();
  flushDNS();

  try {
    if (existsSync(PID_PATH)) unlinkSync(PID_PATH);
  } catch {}
}

export function cleanupStaleBlocks(): void {
  if (!existsSync(PID_PATH)) return;
  const pid = parseInt(readFileSync(PID_PATH, "utf-8").trim());
  try {
    process.kill(pid, 0);
  } catch {
    unblockSites();
  }
}
