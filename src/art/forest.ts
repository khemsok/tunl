import type { ArtTheme, ArtStage, ArtSegment, ArtLine } from "./city";
import { NUM_STAGES } from "./city";

const SKY = "#6C7086";
const TRUNK = "#8A7060";
const TRUNK_DIM = "#6E5A4A";
const LEAF1 = "#6E8050";
const LEAF2 = "#A6DA95";
const LEAF3 = "#B8E6A8";
const LEAF_DIM = "#5A6844";
const GRASS = "#6E8050";
const GRASS_BRIGHT = "#8EA870";
const FLOWER_PINK = "#F5BDE6";
const FLOWER_YELLOW = "#EED49F";
const FLOWER_BLUE = "#8AADF4";
const FLOWER_WHITE = "#E0F0FF";
const BIRD = "#B8C0E0";
const SUN_CORE = "#EED49F";
const SUN_GLOW = "#F5DEB0";
const SUN_RAY = "#E0D090";
const GROUND = "#7F849C";
const BUTTERFLY = "#C6A0F6";
const MUSHROOM = "#F5A97F";
const CLOUD = "#9399B2";
const CLOUD_DIM = "#7F849C";

const ART_W = 70;
const ART_H = 24;
const GRASS_ROW = ART_H - 2;

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263 + 1274126177) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return (h ^ (h >> 16)) >>> 0;
}

// Round-canopy trees
type Tree = { x: number; trunkH: number; radius: number; revealAt: number };
const TREES: Tree[] = [
  { x: 10, trunkH: 4, radius: 6, revealAt: 0.01 },
  { x: 25, trunkH: 5, radius: 5, revealAt: 0.03 },
  { x: 40, trunkH: 4, radius: 7, revealAt: 0.02 },
  { x: 56, trunkH: 5, radius: 5, revealAt: 0.04 },
];

function generateForest(progress: number, tick: number): ArtStage {
  type Cell = { ch: string; fg: string };
  const grid: Cell[][] = [];
  for (let r = 0; r < ART_H; r++) {
    grid[r] = [];
    for (let c = 0; c < ART_W; c++) {
      grid[r][c] = { ch: " ", fg: SKY };
    }
  }

  // ── Sun — big, with animated rays, appears at 5% ──
  if (progress > 0.05) {
    const sunX = 55;
    const sunY = 2;
    const sunProgress = Math.min((progress - 0.05) / 0.2, 1);
    const pulse = tick % 6;

    // Sun body — 3x3 with rounded edges
    if (sunProgress > 0.3) {
      const sc = pulse < 3 ? SUN_CORE : SUN_GLOW;
      //   ╭─╮
      //   │ │
      //   ╰─╯
      grid[sunY][sunX] = { ch: "╭", fg: sc };
      grid[sunY][sunX + 1] = { ch: "─", fg: sc };
      grid[sunY][sunX + 2] = { ch: "─", fg: sc };
      grid[sunY][sunX + 3] = { ch: "─", fg: sc };
      grid[sunY][sunX + 4] = { ch: "╮", fg: sc };

      grid[sunY + 1][sunX - 1] = { ch: "│", fg: sc };
      grid[sunY + 1][sunX] = { ch: " ", fg: sc };
      grid[sunY + 1][sunX + 1] = { ch: "☀", fg: SUN_CORE };
      grid[sunY + 1][sunX + 2] = { ch: " ", fg: sc };
      grid[sunY + 1][sunX + 3] = { ch: " ", fg: sc };
      grid[sunY + 1][sunX + 4] = { ch: " ", fg: sc };
      grid[sunY + 1][sunX + 5] = { ch: "│", fg: sc };

      grid[sunY + 2][sunX] = { ch: "╰", fg: sc };
      grid[sunY + 2][sunX + 1] = { ch: "─", fg: sc };
      grid[sunY + 2][sunX + 2] = { ch: "─", fg: sc };
      grid[sunY + 2][sunX + 3] = { ch: "─", fg: sc };
      grid[sunY + 2][sunX + 4] = { ch: "╯", fg: sc };

      // Animated rays
      if (sunProgress > 0.6) {
        const rayPhase = tick % 4;
        const rayChars = ["·", "'", "·", "`"];
        const rayPositions = [
          // top
          [sunY - 1, sunX + 1], [sunY - 1, sunX + 2], [sunY - 1, sunX + 3],
          // bottom
          [sunY + 3, sunX + 1], [sunY + 3, sunX + 2], [sunY + 3, sunX + 3],
          // left
          [sunY, sunX - 2], [sunY + 1, sunX - 2], [sunY + 2, sunX - 2],
          // right
          [sunY, sunX + 5], [sunY + 1, sunX + 6], [sunY + 2, sunX + 5],
          // diagonals
          [sunY - 1, sunX - 1], [sunY - 1, sunX + 5],
          [sunY + 3, sunX - 1], [sunY + 3, sunX + 5],
        ];
        for (let i = 0; i < rayPositions.length; i++) {
          const [ry, rx] = rayPositions[i];
          if (ry >= 0 && ry < GRASS_ROW && rx >= 0 && rx < ART_W && grid[ry][rx].ch === " ") {
            const show = (rayPhase + i) % 3 !== 0; // flicker pattern
            if (show) {
              grid[ry][rx] = { ch: rayChars[(tick + i) % rayChars.length], fg: SUN_RAY };
            }
          }
        }
      }
    }
  }

  // ── Clouds — drift across, appear at 15% ──
  if (progress > 0.15) {
    const numClouds = Math.min(Math.floor((progress - 0.15) * 8), 2);
    for (let ci = 0; ci < numClouds; ci++) {
      const cloudY = ci === 0 ? 1 : 3;
      const cloudX = ((80 - tick + ci * 35) % (ART_W + 20)) - 10;
      const cc = (tick + ci) % 4 < 2 ? CLOUD : CLOUD_DIM;
      const shape = ci % 2 === 0 ? [" .-. ", "(   )", " '-' "] : ["  .-.  ", " (   ) ", "  '-'  "];
      for (let row = 0; row < shape.length; row++) {
        const cr = cloudY + row;
        if (cr < 0 || cr >= GRASS_ROW - 4) continue;
        for (let col = 0; col < shape[row].length; col++) {
          const cc2 = cloudX + col;
          if (cc2 < 0 || cc2 >= ART_W || shape[row][col] === " ") continue;
          if (grid[cr][cc2].ch === " ") {
            grid[cr][cc2] = { ch: shape[row][col], fg: cc };
          }
        }
      }
    }
  }

  // ── Grass ──
  if (progress > 0.005) {
    for (let c = 0; c < ART_W; c++) {
      const seed = hash(c, 999);
      const sway = (tick + c) % 6;
      const gChar = sway < 3 ? "~" : "∼";
      const gColor = (tick + c) % 10 === 0 ? GRASS_BRIGHT : GRASS;
      grid[GRASS_ROW][c] = { ch: gChar, fg: progress > 0.1 ? gColor : LEAF_DIM };
    }
    for (let c = 0; c < ART_W; c++) {
      grid[ART_H - 1][c] = { ch: " ", fg: GROUND };
    }
  }

  // ── Trees — clean ASCII triangle trees with layered canopy ──
  for (const tree of TREES) {
    if (progress < tree.revealAt) continue;
    const tp = Math.min((progress - tree.revealAt) / 0.25, 1);

    const cx = tree.x; // center x of trunk
    const trunkBase = GRASS_ROW - 1;

    // Trunk — grows up
    const trunkVisible = Math.max(1, Math.ceil(tp * tree.trunkH));
    for (let i = 0; i < trunkVisible; i++) {
      const row = trunkBase - i;
      if (row < 0) continue;
      grid[row][cx] = { ch: "│", fg: TRUNK };
      grid[row][cx + 1] = { ch: "│", fg: TRUNK };
    }

    // Canopy — layered triangle shape, grows from tip down
    if (tp > 0.25) {
      const canopyP = Math.min((tp - 0.25) / 0.5, 1);
      const maxH = tree.radius + 2; // total canopy rows
      const visibleH = Math.max(1, Math.ceil(canopyP * maxH));
      const tipRow = trunkBase - tree.trunkH - maxH + 1;

      for (let i = 0; i < visibleH; i++) {
        const row = tipRow + (maxH - visibleH) + i;
        if (row < 0 || row >= GRASS_ROW) continue;

        // Width grows linearly from tip (1) to base
        const rowFromTip = i + (maxH - visibleH);
        const halfW = Math.floor(rowFromTip * 1.2) + 1;

        for (let dx = -halfW; dx <= halfW + 1; dx++) {
          const c = cx + dx;
          if (c < 0 || c >= ART_W) continue;

          // Edges: / and \
          if (dx === -halfW) {
            grid[row][c] = { ch: "/", fg: tp > 0.6 ? LEAF2 : LEAF_DIM };
          } else if (dx === halfW + 1) {
            grid[row][c] = { ch: "\\", fg: tp > 0.6 ? LEAF2 : LEAF_DIM };
          } else if (rowFromTip === 0 && dx === 0) {
            // Tip
            grid[row][c] = { ch: "/", fg: tp > 0.6 ? LEAF2 : LEAF_DIM };
            if (c + 1 < ART_W) grid[row][c + 1] = { ch: "\\", fg: tp > 0.6 ? LEAF2 : LEAF_DIM };
          } else {
            // Interior — leaf characters that shimmer
            const seed = hash(c, row);
            const shimmer = (tick + seed) % 7;

            let fg: string;
            if (tp > 0.8) {
              fg = shimmer === 0 ? LEAF3 : shimmer < 3 ? LEAF2 : LEAF1;
            } else if (tp > 0.5) {
              fg = shimmer < 2 ? LEAF2 : LEAF1;
            } else {
              fg = LEAF_DIM;
            }

            // Use simple, clean leaf characters
            const leafChars = ["♣", "♠", "*", "·"];
            const ch = leafChars[seed % leafChars.length];
            grid[row][c] = { ch, fg };
          }
        }
      }
    }
  }

  // ── Flowers — along grass, appear at 18% ──
  if (progress > 0.18) {
    const flowerColors = [FLOWER_PINK, FLOWER_YELLOW, FLOWER_BLUE, FLOWER_WHITE];
    for (let c = 0; c < ART_W; c++) {
      const seed = hash(c, 500);
      if (seed % 6 !== 0) continue;
      const appear = 0.18 + (seed % 25) / 100;
      if (progress < appear) continue;
      const colorIdx = seed % flowerColors.length;
      const bloom = (tick + seed) % 8;
      const ch = bloom === 0 ? "✿" : bloom < 3 ? "*" : bloom < 5 ? "·" : "*";
      const fg = bloom === 0 ? FLOWER_WHITE : flowerColors[colorIdx];
      grid[GRASS_ROW][c] = { ch, fg };
    }
  }

  // ── Birds — fly across, appear at 25% ──
  if (progress > 0.25) {
    const numBirds = Math.min(Math.floor((progress - 0.25) * 12), 4);
    for (let b = 0; b < numBirds; b++) {
      const by = 1 + (b % 3);
      const bx = ((tick * 2 + b * 19) % (ART_W + 15)) - 8;
      if (bx >= 0 && bx < ART_W && by >= 0 && by < GRASS_ROW - 5) {
        const wing = (tick + b * 3) % 4;
        if (grid[by][bx].ch === " ") {
          grid[by][bx] = { ch: wing < 2 ? "~" : "^", fg: BIRD };
        }
      }
    }
  }

  // ── Butterflies — flutter near trees, appear at 40% ──
  if (progress > 0.4) {
    const numB = Math.min(Math.floor((progress - 0.4) * 10), 3);
    for (let b = 0; b < numB; b++) {
      const seed = hash(b, 700);
      const baseX = TREES[b % TREES.length].x;
      const bx = baseX + Math.round(Math.sin((tick + b * 4) * 0.7) * 4);
      const by = GRASS_ROW - 4 + ((tick + b * 3) % 3 - 1);
      if (bx >= 0 && bx < ART_W && by >= 0 && by < GRASS_ROW) {
        const ch = (tick + b) % 3 === 0 ? "◊" : (tick + b) % 3 === 1 ? "*" : "°";
        if (grid[by][bx].ch === " ") {
          grid[by][bx] = { ch, fg: BUTTERFLY };
        }
      }
    }
  }

  // ── Mushrooms — appear at 30% ──
  if (progress > 0.3) {
    const positions = [4, 18, 33, 48, 62];
    for (const mx of positions) {
      const seed = hash(mx, 800);
      if (progress < 0.3 + (seed % 20) / 100) continue;
      const row = GRASS_ROW - 1;
      if (row >= 0 && mx < ART_W && grid[row][mx].ch === " ") {
        grid[row][mx] = { ch: "♠", fg: MUSHROOM };
      }
    }
  }

  // ── Falling leaves — drift down, appear at 50% ──
  if (progress > 0.5) {
    const num = Math.min(Math.floor((progress - 0.5) * 10), 4);
    for (let l = 0; l < num; l++) {
      const seed = hash(l, 600);
      const lx = ((seed % 50) + 10 + Math.round(Math.sin(tick * 0.3 + l) * 3)) % ART_W;
      const ly = ((tick + l * 5) % (GRASS_ROW - 4)) + 3;
      if (lx >= 0 && lx < ART_W && ly >= 0 && ly < GRASS_ROW && grid[ly][lx].ch === " ") {
        grid[ly][lx] = { ch: "·", fg: LEAF2 };
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
  previewStages.push(generateForest(i / (NUM_STAGES - 1), 5));
}

export const forestTheme: ArtTheme = {
  name: "Forest",
  stages: previewStages,
  generate: generateForest,
};
