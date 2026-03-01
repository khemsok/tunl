# tunl

Terminal focus timer that blocks distracting websites and progressively reveals animated ASCII art the longer you stay focused.

Enter the tunnel. Block everything out.

## Install

```bash
npm install -g @khemsok/tunl
```

Then just run `tunl` from anywhere.

## What it does

1. Blocks distracting websites (twitter, reddit, youtube, etc.) by modifying `/etc/hosts`
2. Starts a countdown timer
3. Progressively reveals animated ASCII art as you stay focused
4. Unblocks everything when the session ends

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

## License

MIT
