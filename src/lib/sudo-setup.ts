import { existsSync, readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { userInfo } from "os";

const SUDOERS_PATH = "/etc/sudoers.d/tunl";
const SUDOERS_VERSION = "2"; // bump when rules change

function buildRules(): string {
  const username = userInfo().username;

  return [
    // /etc/hosts blocking
    `${username} ALL=(root) NOPASSWD: /bin/cp */.tunl-block.tmp /etc/hosts`,
    `${username} ALL=(root) NOPASSWD: /bin/cp */.tunl-hosts.tmp /etc/hosts`,
    // DNS cache flushing
    `${username} ALL=(root) NOPASSWD: /usr/sbin/dscacheutil -flushcache`,
    `${username} ALL=(root) NOPASSWD: /usr/bin/killall -HUP mDNSResponder`,
    `${username} ALL=(root) NOPASSWD: /usr/bin/killall mDNSResponderHelper`,
    // pfctl firewall
    `${username} ALL=(root) NOPASSWD: /sbin/pfctl *`,
    // pfctl anchor and config file management
    `${username} ALL=(root) NOPASSWD: /bin/cp */.tunl-pf-anchor.tmp /etc/pf.anchors/tunl`,
    `${username} ALL=(root) NOPASSWD: /bin/cp */.tunl-pf-empty.tmp /etc/pf.anchors/tunl`,
    `${username} ALL=(root) NOPASSWD: /bin/cp */.tunl-pf-conf.tmp /etc/pf.conf`,
  ].join("\n");
}

/**
 * Checks if the tunl sudoers rule is installed and up to date.
 */
export function sudoersInstalled(): boolean {
  if (!existsSync(SUDOERS_PATH)) return false;

  try {
    const content = readFileSync(SUDOERS_PATH, "utf-8");
    return content.includes(`# tunl-version: ${SUDOERS_VERSION}`);
  } catch {
    return false;
  }
}

/**
 * Installs a sudoers rule that allows the current user to run
 * tunl's specific commands without a password. Requires one-time
 * sudo to install the rule itself.
 */
export function installSudoers(): void {
  const rules = buildRules();
  const content = `# tunl - terminal focus timer\n# tunl-version: ${SUDOERS_VERSION}\n# allows site blocking without password prompts\n${rules}\n`;

  const tmpPath = "/tmp/tunl-sudoers";
  writeFileSync(tmpPath, content, { mode: 0o440 });

  // visudo -cf validates the sudoers file syntax
  execSync(`sudo visudo -cf ${tmpPath}`);

  // Install to /etc/sudoers.d/ (this directory is included by default on macOS)
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
