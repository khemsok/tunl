#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { execSync } from "child_process";

import { App } from "./app";
import { loadConfig, saveConfig } from "./config";
import { setupBrowserDNS } from "./lib/browser-dns";
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
    await resetConfig();
    process.exit(0);
  }

  if (args.sites) {
    saveConfig({ blockedSites: args.sites });
    console.log(`\n  \u2713 Blocklist updated: ${args.sites.join(", ")}\n`);
  }

  if (!args.noblock) {
    const needsRestart = setupBrowserDNS();
    if (needsRestart) {
      console.log("\n  \u25C9 tunl \u2014 first-time setup\n");
      console.log(
        "  Disabled browser built-in DNS so site blocking works.",
      );
      console.log(
        "  Please restart your browser (Chrome/Arc/Edge) for this to take effect.",
      );
      console.log("  This only needs to happen once.\n");
    }
  }

  if (!args.noblock) {
    console.log("\n  \u25C9 tunl \u2014 Terminal Focus Timer\n");
    console.log("  tunl needs sudo access to block distracting sites.");
    console.log("  You'll be prompted for your password.\n");
    try {
      execSync("sudo -v", { stdio: "inherit" });
      console.log("\n  \u2713 Ready! Entering focus mode...\n");
    } catch {
      console.log(
        "\n  \u2715 Could not get sudo access. Running without site blocking.\n",
      );
      args.noblock = true;
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

async function resetConfig(): Promise<void> {
  const { unlinkSync, existsSync } = await import("fs");
  const { homedir } = await import("os");
  const { join } = await import("path");
  const configPath = join(homedir(), ".tunl.json");

  if (existsSync(configPath)) {
    unlinkSync(configPath);
    console.log("\n  \u2713 Config reset. Next run will show onboarding.\n");
  } else {
    console.log("\n  No config found. Already fresh.\n");
  }
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
