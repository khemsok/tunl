# tunl

Terminal focus timer that blocks distracting websites and progressively reveals animated ASCII art the longer you stay focused.

Enter the tunnel. Block everything out.

## Install

Requires [Bun](https://bun.sh) (the TUI framework uses Bun's native FFI).

```bash
# install bun if you don't have it
curl -fsSL https://bun.sh/install | bash

# run tunl
bunx tunl
```

Or install globally:

```bash
bun install -g tunl
tunl
```

## What it does

1. Blocks distracting websites (twitter, reddit, youtube, etc.) by modifying `/etc/hosts`
2. Starts a countdown timer
3. Progressively reveals animated ASCII art as you stay focused
4. Unblocks everything when the session ends

## Art Themes

Three animated themes that evolve in real-time:

- **City Skyline** — buildings rise, windows flicker on, moon glows, stars twinkle, shooting stars streak across, clouds drift
- **Forest** — trees grow from trunks to full canopy, sun rises with rays, birds fly, butterflies flutter, flowers bloom
- **Space** — stars fill the void, planet forms with rings, nebula swirls, rocket builds and launches with animated fire, comets streak past

The art is procedurally generated and animated every 800ms — stars twinkle, windows flicker, neon signs pulse. Nothing is static.

## Controls

| Key | Action |
|-----|--------|
| `space` | Start / pause / resume |
| `r` | Stop session (back to idle) |
| `q` | Quit app |
| `+/-` | Adjust time by 5 min (before starting) |
| `s` | Edit blocked sites |
| `t` | Change art theme |
| `Ctrl+C` | Quit from any screen |

## CLI Flags

```bash
tunl                         # start with saved preferences
tunl --duration 45           # 45 minute session
tunl --block "site.com"      # add extra sites to block
tunl --sites "a.com,b.com"   # set the full blocklist
tunl --noblock               # timer + art only, no blocking
tunl --config                # show saved config
tunl --reset                 # reset config, re-run onboarding
```

## How blocking works

tunl appends entries to `/etc/hosts` mapping blocked domains to `127.0.0.1`. This requires sudo access — you'll be prompted before the timer starts.

Sites are unblocked when:
- The session completes
- You stop the session with `r`
- You quit with `q` or `Ctrl+C`
- If the process crashes, the next run detects stale entries and cleans up

**Note:** If your browser uses DNS-over-HTTPS (Chrome, Arc, Firefox), you need to disable it for blocking to work:
- **Chrome/Arc:** `chrome://settings/security` or `arc://settings/privacy` → turn off "Use secure DNS"
- **Firefox:** Settings → Privacy & Security → DNS over HTTPS → Off
- **Safari:** Works by default

## Config

Preferences are saved to `~/.tunl.json` after first run. Edit with `tunl --config` to view, `tunl --reset` to start fresh, or press `s`/`t` in the app.

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript
- **TUI Framework:** @opentui/react
- **Art:** Procedurally generated, animated every 800ms

## License

MIT
