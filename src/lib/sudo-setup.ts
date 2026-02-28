import { existsSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { userInfo } from "os";

function which(cmd: string): string {
  return execSync(`which ${cmd}`, { encoding: "utf-8" }).trim();
}

function buildRules(): string {
  const username = userInfo().username;
  const cp = which("cp");
  const dscacheutil = which("dscacheutil");
  const killall = which("killall");
  const pfctl = which("pfctl");

  return [
    // /etc/hosts blocking
    `${username} ALL=(root) NOPASSWD: ${cp} */.tunl-block.tmp /etc/hosts`,
    `${username} ALL=(root) NOPASSWD: ${cp} */.tunl-hosts.tmp /etc/hosts`,
    // DNS cache flushing
    `${username} ALL=(root) NOPASSWD: ${dscacheutil} -flushcache`,
    `${username} ALL=(root) NOPASSWD: ${killall} -HUP mDNSResponder`,
    `${username} ALL=(root) NOPASSWD: ${killall} mDNSResponderHelper`,
    // pfctl firewall
    `${username} ALL=(root) NOPASSWD: ${pfctl} *`,
    // pfctl anchor and config file management
    `${username} ALL=(root) NOPASSWD: ${cp} */.tunl-pf-anchor.tmp /etc/pf.anchors/tunl`,
    `${username} ALL=(root) NOPASSWD: ${cp} */.tunl-pf-empty.tmp /etc/pf.anchors/tunl`,
    `${username} ALL=(root) NOPASSWD: ${cp} */.tunl-pf-conf.tmp /etc/pf.conf`,
  ].join("\n");
}

const SUDOERS_PATH = "/etc/sudoers.d/tunl";

export function sudoersInstalled(): boolean {
  return existsSync(SUDOERS_PATH);
}

export function sudoersNeedsUpdate(): boolean {
  if (!sudoersInstalled()) return false;
  try {
    execSync(`sudo -n ${which("dscacheutil")} -flushcache`, { stdio: "ignore" });
    return false;
  } catch {
    return true;
  }
}

/**
 * Installs a sudoers rule that allows the current user to run
 * tunl's specific commands without a password. Requires one-time
 * sudo to install the rule itself.
 */
export function installSudoers(): void {
  const rules = buildRules();
  const content = `# tunl - terminal focus timer\n# allows site blocking without password prompts\n${rules}\n`;

  const tmpPath = "/tmp/tunl-sudoers";
  writeFileSync(tmpPath, content, { mode: 0o440 });

  execSync(`sudo visudo -cf ${tmpPath}`);
  execSync(`sudo install -m 0440 ${tmpPath} ${SUDOERS_PATH}`);
  execSync(`rm ${tmpPath}`);
}

/**
 * Removes the tunl sudoers rule.
 */
export function removeSudoers(): void {
  if (existsSync(SUDOERS_PATH)) {
    try {
      execSync(`sudo rm ${SUDOERS_PATH}`);
    } catch {}
  }
}
