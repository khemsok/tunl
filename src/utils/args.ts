export type CliOptions = {
  duration: number | undefined;
  noblock: boolean;
  extraBlocks: string[];
  sites: string[] | undefined;
  showConfig: boolean;
  showStats: boolean;
  resetConfig: boolean;
  uninstall: boolean;
};

export function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    duration: undefined,
    noblock: false,
    extraBlocks: [],
    sites: undefined,
    showConfig: false,
    showStats: false,
    resetConfig: false,
    uninstall: false,
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
    } else if (arg === "--stats") {
      opts.showStats = true;
    } else if (arg === "--reset") {
      opts.resetConfig = true;
    } else if (arg === "--uninstall") {
      opts.uninstall = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return opts;
}

function printHelp(): void {
  console.log(`
  tunl — Terminal Focus Timer with Art Reveal

  Usage:
    tunl                         Start with saved preferences
    tunl --duration 45           45 minute session
    tunl --block "site.com"      Add extra sites to block
    tunl --sites "site1,site2"   Set the full blocklist (saves to config)
    tunl --noblock               Timer + art only, no site blocking
    tunl --stats                 Show focus stats and streaks
    tunl --config                Show current saved config
    tunl --reset                 Reset config (re-run onboarding)
    tunl --uninstall             Remove all tunl system files (sudoers, config, DNS settings)
    tunl --help                  Show this help

  Controls:
    space    Start / restart timer
    q        Quit
    +/-      Adjust time by 5 minutes (before starting)
`);
}
