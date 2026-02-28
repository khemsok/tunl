# tunl

Terminal focus timer that blocks distracting websites and progressively reveals animated ASCII art the longer you stay focused.

Enter the tunnel. Block everything out.

## Install

Requires [Bun](https://bun.sh).

```bash
bun add -g @khemsok/tunl
```

Then just run `tunl` from anywhere.

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
| `q` | Quit |
| `+/-` | Adjust time by 5 min (before starting) |
| `s` | Edit blocked sites |
| `t` | Change art theme |
| `i` | View focus stats |
| `Ctrl+C` | Force quit from any screen |

## CLI Flags

```bash
tunl                         # start with saved preferences
tunl --duration 45           # 45 minute session
tunl --block "site.com"      # add extra sites to block
tunl --sites "a.com,b.com"   # set the full blocklist
tunl --noblock               # timer + art only, no blocking
tunl --stats                 # show focus stats and streaks
tunl --config                # show saved config
tunl --reset                 # reset config, re-run onboarding
tunl --help                  # show usage help
```

## How blocking works

tunl appends entries to `/etc/hosts` mapping blocked domains to `0.0.0.0`. This requires sudo access — you'll be prompted before the timer starts.

Sites are unblocked when:
- The session completes
- You stop the session with `r`
- You quit with `q` or `Ctrl+C`
- If the process crashes, the next run detects stale entries and cleans up

## Config

Preferences are saved to `~/.tunl.json` after first run. Edit with `tunl --config` to view, `tunl --reset` to start fresh, or press `s`/`t` in the app.

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript
- **TUI Framework:** @opentui/react
- **Art:** Procedurally generated, animated every 800ms

## License

MIT
