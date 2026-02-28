import type { ArtTheme, ArtStage, ArtSegment, ArtLine } from "./city";
import { NUM_STAGES } from "./city";

const SKY = "#6C7086";
const STAR = "#B8C0E0";
const STAR_B = "#E0F0FF";
const STAR_DIM = "#7F849C";
const PLANET = "#F5A97F";
const PLANET_DIM = "#C08060";
const RING = "#EED49F";
const RING_DIM = "#B8A070";
const ROCKET_BODY = "#B8C0E0";
const ROCKET_WIN = "#8AADF4";
const FIRE1 = "#F5A97F";
const FIRE2 = "#ED8796";
const FIRE3 = "#EED49F";
const NEBULA1 = "#C6A0F6";
const NEBULA2 = "#8AADF4";
const NEBULA3 = "#F5BDE6";
const COMET = "#E0F0FF";

const ART_W = 70;
const ART_H = 24;

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263 + 1274126177) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return (h ^ (h >> 16)) >>> 0;
}

function generateSpace(progress: number, tick: number): ArtStage {
  type Cell = { ch: string; fg: string };
  const grid: Cell[][] = [];
  for (let r = 0; r < ART_H; r++) {
    grid[r] = [];
    for (let c = 0; c < ART_W; c++) {
      grid[r][c] = { ch: " ", fg: SKY };
    }
  }

  // ── Stars — fill space, twinkle always ──
  const starDensity = Math.min(progress * 4, 1);
  for (let r = 0; r < ART_H; r++) {
    for (let c = 0; c < ART_W; c++) {
      const seed = hash(c, r);
      if (seed % 100 < starDensity * 12) {
        const twinkle = (tick + seed) % 7;
        const type = seed % 6;
        if (type === 0) {
          grid[r][c] = { ch: twinkle < 2 ? "✦" : "·", fg: twinkle < 3 ? STAR_B : STAR };
        } else if (type === 1) {
          grid[r][c] = { ch: twinkle < 2 ? "+" : "·", fg: twinkle < 2 ? STAR_B : STAR_DIM };
        } else {
          if (twinkle < 3) grid[r][c] = { ch: "·", fg: STAR };
          else if (twinkle < 5) grid[r][c] = { ch: "·", fg: STAR_DIM };
          // else stays blank — twinkle off
        }
      }
    }
  }

  // ── Nebula — colorful gas clouds, drift slowly, appear at 15% ──
  if (progress > 0.15) {
    const nebulaProgress = Math.min((progress - 0.15) / 0.3, 1);
    const nebulaColors = [NEBULA1, NEBULA2, NEBULA3];
    // Two nebula patches
    const patches = [
      { cx: 8, cy: 3, size: 6 },
      { cx: 58, cy: 9, size: 5 },
    ];
    for (const patch of patches) {
      const drift = Math.floor(tick * 0.3) % 3 - 1;
      for (let dy = -patch.size; dy <= patch.size; dy++) {
        for (let dx = -patch.size; dx <= patch.size; dx++) {
          const dist = Math.abs(dx) + Math.abs(dy);
          if (dist > patch.size) continue;
          const density = 1 - dist / patch.size;
          if (density < 0.3 || Math.random() > density * nebulaProgress) continue;
          const r = patch.cy + dy;
          const c = patch.cx + dx + drift;
          if (r < 0 || r >= ART_H || c < 0 || c >= ART_W) continue;
          const seed = hash(c + tick * 3, r);
          if (seed % 4 === 0) {
            const nebColor = nebulaColors[seed % nebulaColors.length];
            const chars = ["░", "▒", "·", "~"];
            const ch = chars[seed % chars.length];
            grid[r][c] = { ch, fg: nebColor };
          }
        }
      }
    }
  }

  // ── Planet with rings — appears at 10% ──
  if (progress > 0.1) {
    const px = 30;
    const py = 3;
    const planetProgress = Math.min((progress - 0.1) / 0.2, 1);
    const pulse = tick % 5;
    const pc = pulse < 2 ? PLANET : PLANET_DIM;
    const rc = pulse < 3 ? RING : RING_DIM;

    if (planetProgress > 0.3) {
      // Planet body
      grid[py][px + 1] = { ch: "╭", fg: pc };
      grid[py][px + 2] = { ch: "─", fg: pc };
      grid[py][px + 3] = { ch: "─", fg: pc };
      grid[py][px + 4] = { ch: "╮", fg: pc };
      grid[py + 1][px] = { ch: "│", fg: pc };
      grid[py + 1][px + 1] = { ch: " ", fg: pc };
      grid[py + 1][px + 2] = { ch: "○", fg: PLANET };
      grid[py + 1][px + 3] = { ch: " ", fg: pc };
      grid[py + 1][px + 4] = { ch: " ", fg: pc };
      grid[py + 1][px + 5] = { ch: "│", fg: pc };
      grid[py + 2][px + 1] = { ch: "╰", fg: pc };
      grid[py + 2][px + 2] = { ch: "─", fg: pc };
      grid[py + 2][px + 3] = { ch: "─", fg: pc };
      grid[py + 2][px + 4] = { ch: "╯", fg: pc };

      // Rings — appear at 50% planet progress
      if (planetProgress > 0.5) {
        if (px - 2 >= 0) grid[py + 1][px - 2] = { ch: "─", fg: rc };
        if (px - 1 >= 0) grid[py + 1][px - 1] = { ch: "─", fg: rc };
        if (px + 6 < ART_W) grid[py + 1][px + 6] = { ch: "─", fg: rc };
        if (px + 7 < ART_W) grid[py + 1][px + 7] = { ch: "─", fg: rc };
      }
    }
  }

  // ── Rocket — builds up from 25%, animated fire ──
  if (progress > 0.25) {
    const rx = 52;
    const rocketProgress = Math.min((progress - 0.25) / 0.3, 1);

    // Rocket body (builds bottom to top)
    const rocketParts = [
      // row offset from base, chars
      { dy: 0, chars: "/│    │\\", minP: 0.0 },
      { dy: -1, chars: " │ ▓▓ │ ", minP: 0.1 },
      { dy: -2, chars: " │    │ ", minP: 0.2 },
      { dy: -3, chars: " /────\\ ", minP: 0.3 },
      { dy: -4, chars: " / ◉◉ \\ ", minP: 0.5 },
      { dy: -5, chars: "  /  \\  ", minP: 0.7 },
      { dy: -6, chars: "  /\\    ", minP: 0.9 },
    ];

    const rocketBase = ART_H - 3;
    for (const part of rocketParts) {
      if (rocketProgress < part.minP) continue;
      const row = rocketBase + part.dy;
      if (row < 0 || row >= ART_H) continue;
      for (let i = 0; i < part.chars.length; i++) {
        const c = rx + i - 1;
        if (c < 0 || c >= ART_W || part.chars[i] === " ") continue;
        grid[row][c] = { ch: part.chars[i], fg: ROCKET_BODY };
      }
      // Color the windows
      if (part.chars.includes("◉")) {
        const winRow = row;
        for (let c = rx; c < rx + 6 && c < ART_W; c++) {
          if (grid[winRow][c].ch === "◉") {
            grid[winRow][c] = { ch: "◉", fg: ROCKET_WIN };
          }
        }
      }
    }

    // Rocket fire — animated flames
    if (rocketProgress > 0.5) {
      const fireRow = rocketBase + 1;
      if (fireRow < ART_H) {
        const fireColors = [FIRE1, FIRE2, FIRE3];
        const fireChars = ["▓", "░", "▒", "█"];
        for (let i = -1; i <= 2; i++) {
          const fc = rx + 2 + i;
          if (fc < 0 || fc >= ART_W) continue;
          const seed = hash(fc, tick);
          const fColor = fireColors[seed % fireColors.length];
          const fChar = fireChars[(tick + i) % fireChars.length];
          grid[fireRow][fc] = { ch: fChar, fg: fColor };
        }
        // Extended flames
        if (fireRow + 1 < ART_H) {
          for (let i = 0; i <= 1; i++) {
            const fc = rx + 2 + i;
            if (fc < 0 || fc >= ART_W) continue;
            const seed = hash(fc, tick + 1);
            const fColor = fireColors[(seed + 1) % fireColors.length];
            grid[fireRow + 1][fc] = { ch: "░", fg: fColor };
          }
        }
      }
    }
  }

  // ── Comets — streak across, appear at 20% ──
  if (progress > 0.2) {
    const cometCycle = Math.floor(tick / 6);
    const cometPhase = tick % 6;
    if (cometPhase < 4) {
      const seed = hash(cometCycle, 7777);
      const startX = seed % (ART_W - 10);
      const startY = (seed >> 4) % (ART_H - 5);
      for (let i = 0; i < 5 - cometPhase; i++) {
        const cx = startX + cometPhase * 2 + i;
        const cy = startY + Math.floor(i / 2);
        if (cx >= 0 && cx < ART_W && cy >= 0 && cy < ART_H && grid[cy][cx].ch === " ") {
          grid[cy][cx] = {
            ch: i === 0 ? "☆" : "·",
            fg: i === 0 ? COMET : i === 1 ? STAR : STAR_DIM
          };
        }
      }
    }
  }

  // ── Convert grid ──
  const lines: ArtLine[] = [];
  for (let r = 0; r < ART_H; r++) {
    const segments: ArtSegment[] = [];
    let currentText = "";
    let currentFg = grid[r][0].fg;
    for (let c = 0; c < ART_W; c++) {
      const cell = grid[r][c];
      if (cell.fg === currentFg) {
        currentText += cell.ch;
      } else {
        if (currentText) segments.push({ text: currentText, fg: currentFg });
        currentText = cell.ch;
        currentFg = cell.fg;
      }
    }
    if (currentText) segments.push({ text: currentText, fg: currentFg });
    lines.push({ segments });
  }
  return { lines };
}

const previewStages: ArtStage[] = [];
for (let i = 0; i < NUM_STAGES; i++) {
  previewStages.push(generateSpace(i / (NUM_STAGES - 1), 5));
}

export const spaceTheme: ArtTheme = {
  name: "Space",
  stages: previewStages,
  generate: generateSpace,
};
