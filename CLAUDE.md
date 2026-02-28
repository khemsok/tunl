# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev              # Run the CLI directly (no build step)
bun run dev:noblock      # Run without site blocking
bun run dev:reset        # Reset config (re-triggers onboarding)
bun run dev:stats        # Print session stats
bun run dev:config       # Print current config
bun run dev:uninstall    # Remove all tunl system artifacts
bun run build            # Bundle to dist/cli.js (single file, bun target)
```

No test framework is configured.

## Architecture

tunl is a terminal focus timer built with Bun, TypeScript, and `@opentui/react` (a terminal UI framework that provides React-like JSX rendering to the terminal via `<box>`, `<text>`, `<span>` elements).

**Entry flow:** `src/cli.tsx` → parses args → runs one-time setup (browser DNS, sudoers) → creates `@opentui/core` renderer (alternate screen) → mounts `<App>` as React root.

**Screen router:** `src/app.tsx` manages 6 screens: `onboarding | timer | completed | sites | themes | stats`. First run shows onboarding wizard; subsequent runs go straight to timer. Keyboard handling lives here via `useKeyboard`.

**Site blocking (macOS only, three layers):**
1. `/etc/hosts` manipulation (`src/lib/blocker.ts`) — writes `0.0.0.0` entries between marker comments, flushed with `dscacheutil`/`mDNSResponder`
2. PF firewall (`src/lib/pf.ts`) — resolves domains via `dig`, writes block rules to `/etc/pf.anchors/tunl`, manages tokens in `~/.tunl-pf-token`
3. Browser DNS override (`src/lib/browser-dns.ts`) — disables built-in DNS-over-HTTPS for Chrome/Arc/Edge/Brave/Vivaldi/Opera via `defaults write`

All sudo operations are covered by a passwordless sudoers rule installed to `/etc/sudoers.d/tunl` (`src/lib/sudo-setup.ts`). Stale blocks from crashed sessions are detected via PID file (`~/.tunl.pid`).

**Timer lifecycle:** `useTimer` hook manages countdown state (`idle → running → paused → finished`). On finish, `recordSession` in `src/lib/session.ts` updates stats and streak in config. Blocking starts/stops with the session.

**Art themes:** `src/art/` contains procedural ASCII art generators (city, forest, space). Each theme's `generate(progress, tick, width)` returns a grid of colored segments. Animation is driven by `useAnimation` (800ms tick interval), independent of the timer.

**Config:** `~/.tunl.json` stores duration, blocked sites, theme preference, and cumulative stats. `src/config.ts` handles load/save with defaults merging.

## Conventions

- No unnecessary comments — only comment where logic isn't self-evident
- JSX uses `@opentui/react` as `jsxImportSource` (not React DOM)
- Color palette defined in `src/theme.ts` (Catppuccin Macchiato-inspired)
- Bun-only runtime; TypeScript strict mode with `bundler` module resolution
