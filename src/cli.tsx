#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { execSync } from "child_process";
import { App } from "./app";
import { loadConfig, saveConfig } from "./config";

// Parse CLI arguments
function parseArgs(argv: string[]) {
  const opts = {
    duration: undefined as number | undefined,
    noblock: false,
    extraBlocks: [] as string[],
    sites: undefined as string[] | undefined,
    showConfig: false,
    resetConfig: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--duration" && argv[i + 1]) {
      opts.duration = parseInt(argv[i + 1], 10);
      i++;
    } else if (arg === "--noblock") {
      opts.noblock = true;
    } else if (arg === "--block" && argv[i + 1]) {
      opts.extraBlocks = argv[i + 1].split(",").map((s) => s.trim());
      i++;
    } else if (arg === "--sites" && argv[i + 1]) {
      opts.sites = argv[i + 1].split(",").map((s) => s.trim());
      i++;
    } else if (arg === "--config") {
      opts.showConfig = true;
    } else if (arg === "--reset") {
      opts.resetConfig = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
  tunl — Terminal Focus Timer with Art Reveal

  Usage:
    tunl                         Start with saved preferences
    tunl --duration 45           45 minute session
    tunl --block "site.com"      Add extra sites to block
    tunl --sites "site1,site2"   Set the full blocklist (saves to config)
    tunl --noblock               Timer + art only, no site blocking
    tunl --config                Show current saved config
    tunl --reset                 Reset config (re-run onboarding)
    tunl --help                  Show this help

  Controls:
    space    Start / restart timer
    q        Quit
    +/-      Adjust time by 5 minutes (before starting)
`);
      process.exit(0);
    }
  }

  return opts;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // --config: show current config and exit
  if (args.showConfig) {
    const config = loadConfig();
    console.log("\n  ◉ tunl config (~/.tunl.json)\n");
    console.log(`  Duration:  ${config.duration} minutes`);
    console.log(`  Theme:     ${config.theme}`);
    console.log(`  No-block:  ${config.noblock}`);
    console.log(`  Sites:     ${config.blockedSites.join(", ")}`);
    console.log(`  First run: ${config.isFirstRun}\n`);
    process.exit(0);
  }

  // --reset: delete config to re-trigger onboarding
  if (args.resetConfig) {
    const { unlinkSync, existsSync } = await import("fs");
    const { homedir } = await import("os");
    const { join } = await import("path");
    const configPath = join(homedir(), ".tunl.json");
    if (existsSync(configPath)) {
      unlinkSync(configPath);
      console.log("\n  ✓ Config reset. Next run will show onboarding.\n");
    } else {
      console.log("\n  No config found. Already fresh.\n");
    }
    process.exit(0);
  }

  // --sites: update the blocklist in config
  if (args.sites) {
    saveConfig({ blockedSites: args.sites });
    console.log(`\n  ✓ Blocklist updated: ${args.sites.join(", ")}\n`);
  }

  // Sudo pre-check BEFORE entering alternate screen
  if (!args.noblock) {
    console.log("\n  ◉ tunl — Terminal Focus Timer\n");
    console.log("  tunl needs sudo access to block distracting sites.");
    console.log("  You'll be prompted for your password.\n");
    try {
      execSync("sudo -v", { stdio: "inherit" });
      console.log("\n  ✓ Ready! Entering focus mode...\n");
    } catch {
      console.log(
        "\n  ✕ Could not get sudo access. Running without site blocking.\n"
      );
      args.noblock = true;
    }
  }

  const renderer = await createCliRenderer({
    useAlternateScreen: true,
    exitOnCtrlC: false,
  });

  const root = createRoot(renderer);
  root.render(
    <App
      initialDuration={args.duration}
      noblock={args.noblock}
      extraBlocks={args.extraBlocks}
    />
  );
}

main().catch((err) => {
  console.error("tunl error:", err);
  process.exit(1);
});
