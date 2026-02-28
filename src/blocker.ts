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

export function blockSites(sites: string[]): void {
  cleanupStaleBlocks();

  const validSites = sites.filter(validateSite);
  if (validSites.length === 0) return;

  writeFileSync(PID_PATH, String(process.pid));

  const entries = validSites
    .flatMap((s) => [`127.0.0.1 ${s}`, `127.0.0.1 www.${s}`])
    .join("\n");

  const block = `\n${START_MARKER}\n${entries}\n${END_MARKER}\n`;

  // Write to a temp file and append via sudo to avoid shell injection
  const tmpPath = join(homedir(), ".tunl-block.tmp");
  writeFileSync(tmpPath, block);
  execSync(`sudo sh -c 'cat "${tmpPath}" >> ${HOSTS_PATH}'`);
  unlinkSync(tmpPath);

  // Flush DNS cache on macOS
  try {
    execSync("sudo dscacheutil -flushcache 2>/dev/null");
  } catch {}
  try {
    execSync("sudo killall -HUP mDNSResponder 2>/dev/null");
  } catch {}
}

export function unblockSites(): void {
  try {
    const hosts = readFileSync(HOSTS_PATH, "utf-8");
    const startIdx = hosts.indexOf(START_MARKER);
    const endIdx = hosts.indexOf(END_MARKER);
    if (startIdx === -1 || endIdx === -1) return;

    const cleaned =
      hosts.slice(0, startIdx) +
      hosts.slice(endIdx + END_MARKER.length);

    // Write cleaned content to temp file and replace via sudo
    const tmpPath = join(homedir(), ".tunl-hosts.tmp");
    writeFileSync(tmpPath, cleaned);
    execSync(`sudo cp "${tmpPath}" ${HOSTS_PATH}`);
    unlinkSync(tmpPath);

    // Flush DNS
    try {
      execSync("sudo dscacheutil -flushcache 2>/dev/null");
    } catch {}
    try {
      execSync("sudo killall -HUP mDNSResponder 2>/dev/null");
    } catch {}
  } catch {}

  // Remove PID file
  try {
    if (existsSync(PID_PATH)) unlinkSync(PID_PATH);
  } catch {}
}

export function cleanupStaleBlocks(): void {
  if (!existsSync(PID_PATH)) return;
  const pid = parseInt(readFileSync(PID_PATH, "utf-8").trim());
  try {
    // Check if process is still running (throws if not)
    process.kill(pid, 0);
  } catch {
    // Process is dead — clean up stale blocks
    unblockSites();
  }
}

export function registerCleanup(): void {
  const cleanup = () => {
    try {
      unblockSites();
    } catch {}
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("uncaughtException", (err) => {
    try {
      unblockSites();
    } catch {}
    console.error(err);
    process.exit(1);
  });
}
