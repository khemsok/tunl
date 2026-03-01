#!/usr/bin/env node
import { existsSync, unlinkSync } from "fs";
import { homedir } from "os";
import { join } from "path";

import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";

import { App } from "./app";
import { loadConfig, saveConfig } from "./config";
import { setupBrowserDNS, restoreBrowserDNS } from "./lib/browser-dns";
import { unblockPF } from "./lib/pf";
import { sudoersInstalled, sudoersNeedsUpdate, installSudoers, removeSudoers } from "./lib/sudo-setup";
import { parseArgs } from "./utils/args";
import { formatMinutes } from "./utils/time";

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.showStats) {
    printStats();
    process.exit(0);
  }

  if (args.showConfig) {
    printConfig();
    process.exit(0);
  }

  if (args.resetConfig) {
    resetConfig();
    process.exit(0);
  }

  if (args.uninstall) {
    uninstall();
    process.exit(0);
  }

  if (args.sites) {
    saveConfig({ blockedSites: args.sites });
    console.log(`\n  \u2713 Blocklist updated: ${args.sites.join(", ")}\n`);
  }

  if (!args.noblock) {
    setupBrowserDNS();

    if (!sudoersInstalled() || sudoersNeedsUpdate()) {
      try {
        installSudoers();
      } catch {
        args.noblock = true;
      }
    }
  }

  const renderer = await createCliRenderer({
    useAlternateScreen: true,
    exitOnCtrlC: false,
    useMouse: false,
    enableMouseMovement: false,
  });

  (globalThis as any).__tunl_renderer = renderer;

  const root = createRoot(renderer);
  root.render(
    <App
      initialDuration={args.duration}
      noblock={args.noblock}
      extraBlocks={args.extraBlocks}
    />,
  );
}

function printStats(): void {
  const config = loadConfig();
  const timeStr = formatMinutes(config.totalMinutesFocused);

  console.log("\n  \u25C9 tunl stats\n");
  console.log(`  Sessions:      ${config.totalSessions}`);
  console.log(`  Total focused: ${timeStr}`);
  console.log(`  Day streak:    ${config.currentStreak}`);
  console.log(`  Last session:  ${config.lastSessionDate || "never"}`);
  console.log(`  Timer:         ${config.duration} min`);
  console.log(`  Theme:         ${config.theme}\n`);
}

function printConfig(): void {
  const config = loadConfig();
  console.log("\n  \u25C9 tunl config (~/.tunl.json)\n");
  console.log(`  Duration:  ${config.duration} minutes`);
  console.log(`  Theme:     ${config.theme}`);
  console.log(`  No-block:  ${config.noblock}`);
  console.log(`  Sites:     ${config.blockedSites.join(", ")}`);
  console.log(`  First run: ${config.isFirstRun}\n`);
}

function resetConfig(): void {
  const configPath = join(homedir(), ".tunl.json");

  if (existsSync(configPath)) {
    unlinkSync(configPath);
    console.log("\n  \u2713 Config reset. Next run will show onboarding.\n");
  } else {
    console.log("\n  No config found. Already fresh.\n");
  }
}

function uninstall(): void {
  console.log("\n  \u25C9 tunl — uninstall\n");

  // Remove sudoers rule
  if (sudoersInstalled()) {
    try {
      removeSudoers();
      console.log("  \u2713 Removed sudo rule (/etc/sudoers.d/tunl)");
    } catch {
      console.log("  \u2715 Could not remove sudo rule (may need manual sudo)");
    }
  } else {
    console.log("  - No sudo rule found");
  }

  // Remove config
  const configPath = join(homedir(), ".tunl.json");
  if (existsSync(configPath)) {
    unlinkSync(configPath);
    console.log("  \u2713 Removed config (~/.tunl.json)");
  } else {
    console.log("  - No config found");
  }

  // Remove DNS setup flag
  const dnsFlag = join(homedir(), ".tunl-dns-setup");
  if (existsSync(dnsFlag)) {
    unlinkSync(dnsFlag);
    console.log("  \u2713 Removed DNS setup flag");
  }

  // Remove PID file
  const pidPath = join(homedir(), ".tunl.pid");
  if (existsSync(pidPath)) {
    unlinkSync(pidPath);
    console.log("  \u2713 Removed PID file");
  }

  // Clean up firewall rules (also removes pf token file)
  try {
    unblockPF();
    console.log("  \u2713 Cleaned up firewall rules");
  } catch {
    console.log("  - No firewall rules to clean");
  }

  // Restore browser DNS settings
  restoreBrowserDNS();
  console.log("  \u2713 Restored browser DNS settings");

  console.log("\n  All clean. Run `bun remove -g @khemsok/tunl` to finish.\n");
}

main().catch((err) => {
  const renderer = (globalThis as any).__tunl_renderer;
  if (renderer) {
    try {
      renderer.destroy();
    } catch {}
  }
  process.stdout.write("\x1b[?25h\x1b[?1049l");
  console.error("tunl error:", err);
  process.exit(1);
});
