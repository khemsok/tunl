import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";
import { homedir } from "os";
import { join } from "path";

const PF_ANCHOR_PATH = "/etc/pf.anchors/tunl";
const PF_CONF_PATH = "/etc/pf.conf";
const PF_TOKEN_PATH = join(homedir(), ".tunl-pf-token");
const ANCHOR_NAME = "tunl";

function isValidDomain(domain: string): boolean {
  return /^[a-zA-Z0-9.-]+$/.test(domain);
}

function digRecords(domain: string, recordType: string): string[] {
  try {
    return execSync(`dig +short ${recordType} ${domain} 2>/dev/null`, {
      encoding: "utf-8",
      timeout: 5000,
    })
      .trim()
      .split("\n");
  } catch {
    return [];
  }
}

function resolveIPs(domain: string): string[] {
  if (!isValidDomain(domain)) return [];

  const v4 = digRecords(domain, "A").filter((line) =>
    /^\d+\.\d+\.\d+\.\d+$/.test(line),
  );
  const v6 = digRecords(domain, "AAAA").filter((line) => line.includes(":"));

  return [...v4, ...v6];
}

function generateRules(sites: string[]): string {
  const lines: string[] = [
    "# tunl packet filter rules",
    "set block-policy drop",
    'set fingerprints "/etc/pf.os"',
    "set skip on lo0",
    "",
  ];

  const allDomains = sites.flatMap((s) => [s, `www.${s}`]);
  const seenIPs = new Set<string>();

  for (const domain of allDomains) {
    const ips = resolveIPs(domain);
    for (const ip of ips) {
      if (seenIPs.has(ip)) continue;
      seenIPs.add(ip);
      lines.push(`block return out proto tcp from any to ${ip}`);
      lines.push(`block return out proto udp from any to ${ip}`);
    }
  }

  return lines.join("\n") + "\n";
}

function addAnchorToConf(): void {
  const conf = readFileSync(PF_CONF_PATH, "utf-8");
  if (conf.includes(`/etc/pf.anchors/${ANCHOR_NAME}`)) return;

  const addition = `\nanchor "${ANCHOR_NAME}"\nload anchor "${ANCHOR_NAME}" from "/etc/pf.anchors/${ANCHOR_NAME}"\n`;
  const newConf = conf.trimEnd() + addition;

  const tmpConf = join(homedir(), ".tunl-pf-conf.tmp");
  writeFileSync(tmpConf, newConf);
  execSync(`sudo cp "${tmpConf}" ${PF_CONF_PATH}`);
  unlinkSync(tmpConf);
}

function removeAnchorFromConf(): void {
  const conf = readFileSync(PF_CONF_PATH, "utf-8");
  if (!conf.includes(ANCHOR_NAME)) return;

  const cleaned =
    conf
      .split("\n")
      .filter((line) => !line.includes(ANCHOR_NAME))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd() + "\n";

  const tmpConf = join(homedir(), ".tunl-pf-conf.tmp");
  writeFileSync(tmpConf, cleaned);
  execSync(`sudo cp "${tmpConf}" ${PF_CONF_PATH}`);
  unlinkSync(tmpConf);
}

export function blockPF(sites: string[]): void {
  const rules = generateRules(sites);
  const tmpAnchor = join(homedir(), ".tunl-pf-anchor.tmp");
  writeFileSync(tmpAnchor, rules);
  execSync(`sudo cp "${tmpAnchor}" ${PF_ANCHOR_PATH}`);
  unlinkSync(tmpAnchor);

  addAnchorToConf();

  const output = execSync(
    `sudo pfctl -E -f ${PF_CONF_PATH} -F states 2>&1`,
    { encoding: "utf-8" },
  );
  const tokenMatch = output.match(/Token\s*:\s*(\S+)/);
  if (tokenMatch) {
    writeFileSync(PF_TOKEN_PATH, tokenMatch[1]);
  }
}

export function unblockPF(): void {
  // Empty the anchor file
  try {
    const tmpEmpty = join(homedir(), ".tunl-pf-empty.tmp");
    writeFileSync(tmpEmpty, "");
    execSync(`sudo cp "${tmpEmpty}" ${PF_ANCHOR_PATH}`);
    unlinkSync(tmpEmpty);
  } catch {}

  // Remove anchor lines from pf.conf
  try {
    removeAnchorFromConf();
  } catch {}

  // Release the pf token
  try {
    if (existsSync(PF_TOKEN_PATH)) {
      const token = readFileSync(PF_TOKEN_PATH, "utf-8").trim();
      if (token) {
        execSync(`sudo pfctl -X ${token} -f ${PF_CONF_PATH} 2>/dev/null`);
      }
      unlinkSync(PF_TOKEN_PATH);
    }
  } catch {}
}

export function hasStalePFBlock(): boolean {
  return existsSync(PF_TOKEN_PATH);
}
