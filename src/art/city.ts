export type ArtSegment = { text: string; fg: string };
export type ArtLine = { segments: ArtSegment[] };
export type ArtStage = { lines: ArtLine[] };
export type ArtTheme = {
  name: string;
  stages: ArtStage[];
  generate?: (progress: number, tick: number, width: number) => ArtStage;
};

export const NUM_STAGES = 20;

const BLDG = "#9399B2";
const BLDG_DIM = "#7F849C";
const WIN_ON = "#EED49F";
const WIN_WARM = "#F5DEB0";
const WIN_DIM = "#6C7086";
const MOON = "#E0F0FF";
const MOON_DIM = "#B8C0E0";
const MOON_GLOW = "#F0F8FF";
const STAR_BRIGHT = "#E0F0FF";
const STAR_DIM = "#9399B2";
const STAR_OFF = "#7F849C";
const SHOOTING = "#F5A97F";
const CLOUD = "#585B70";
const CLOUD_BRIGHT = "#6C7086";
const GROUND = "#9399B2";
const SKY = "#6C7086";

function hash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263 + 1274126177) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return (h ^ (h >> 16)) >>> 0;
}

type Building = { x: number; w: number; h: number; windows: number; revealAt: number };

const BUILDINGS: Building[] = [
  { x: 2, w: 4, h: 8, windows: 1, revealAt: 0.02 },
  { x: 8, w: 7, h: 14, windows: 2, revealAt: 0.01 },
  { x: 17, w: 5, h: 7, windows: 1, revealAt: 0.04 },
  { x: 24, w: 4, h: 10, windows: 1, revealAt: 0.03 },
  { x: 29, w: 3, h: 5, windows: 0, revealAt: 0.08 },
  { x: 33, w: 5, h: 12, windows: 1, revealAt: 0.02 },
  { x: 39, w: 4, h: 7, windows: 1, revealAt: 0.05 },
  { x: 44, w: 6, h: 11, windows: 2, revealAt: 0.03 },
  { x: 52, w: 4, h: 13, windows: 1, revealAt: 0.01 },
  { x: 57, w: 6, h: 9, windows: 2, revealAt: 0.04 },
  { x: 64, w: 4, h: 6, windows: 1, revealAt: 0.06 },
];

const ART_W = 70;
const ART_H = 24;
const GROUND_ROW = ART_H - 1;
const SKYLINE_BASE = ART_H - 2;

function generateCity(progress: number, tick: number): ArtStage {
  type Cell = { ch: string; fg: string };
  const grid: Cell[][] = [];
  for (let r = 0; r < ART_H; r++) {
    grid[r] = [];
    for (let c = 0; c < ART_W; c++) {
      grid[r][c] = { ch: " ", fg: SKY };
    }
  }

  // ── Ground ──
  if (progress >= 0.005) {
    for (let c = 0; c < ART_W; c++) {
      grid[GROUND_ROW][c] = { ch: "─", fg: progress > 0.1 ? GROUND : BLDG_DIM };
    }
  }

  // ── Buildings ──
  for (const bldg of BUILDINGS) {
    if (progress < bldg.revealAt) continue;
    const bldgProgress = Math.min((progress - bldg.revealAt) / 0.15, 1);
    const visibleH = Math.max(1, Math.ceil(bldgProgress * bldg.h));
    const color = bldgProgress > 0.5 ? BLDG : BLDG_DIM;

    for (let row = 0; row < visibleH; row++) {
      const gridRow = SKYLINE_BASE - row;
      if (gridRow < 0) continue;
      for (let col = bldg.x; col < bldg.x + bldg.w && col < ART_W; col++) {
        if (row === visibleH - 1) {
          if (col === bldg.x) grid[gridRow][col] = { ch: "┌", fg: color };
          else if (col === bldg.x + bldg.w - 1) grid[gridRow][col] = { ch: "┐", fg: color };
          else grid[gridRow][col] = { ch: "─", fg: color };
        } else if (row === 0) {
          if (col === bldg.x) grid[gridRow][col] = { ch: "┴", fg: color };
          else if (col === bldg.x + bldg.w - 1) grid[gridRow][col] = { ch: "┴", fg: color };
          else grid[gridRow][col] = { ch: "─", fg: color };
          grid[GROUND_ROW][col] = { ch: "─", fg: GROUND };
        } else {
          if (col === bldg.x || col === bldg.x + bldg.w - 1) {
            grid[gridRow][col] = { ch: "│", fg: color };
          } else {
            const winCol = col - bldg.x - 1;
            const winRow = row - 1;
            if (bldg.windows > 0 && winCol >= 0 && winCol < bldg.w - 2) {
              const seed = hash(bldg.x + winCol, winRow);
              const winProgress = (progress - bldg.revealAt) / 0.3;
              const turnOnAt = (seed % 100) / 100;
              const isTimeToLight = winProgress > turnOnAt;
              const flickerCycle = (tick + seed) % 11;
              const isFlickering = flickerCycle === 0;
              const warmCycle = (tick + seed) % 7 === 0;

              if (isTimeToLight && !isFlickering) {
                grid[gridRow][col] = { ch: "■", fg: warmCycle ? WIN_WARM : WIN_ON };
              } else if (isTimeToLight && isFlickering) {
                grid[gridRow][col] = { ch: "■", fg: WIN_DIM };
              } else {
                grid[gridRow][col] = { ch: "·", fg: WIN_DIM };
              }
            } else {
              grid[gridRow][col] = { ch: " ", fg: color };
            }
          }
        }
      }
    }

    // Antenna
    if (bldg.h >= 7 && bldgProgress > 0.8) {
      const antennaCol = bldg.x + Math.floor(bldg.w / 2);
      const topRow = SKYLINE_BASE - visibleH;
      if (topRow >= 0) {
        grid[topRow][antennaCol] = { ch: "│", fg: BLDG_DIM };
        if (topRow - 1 >= 0) {
          // Blinking light on antenna
          const blinkOn = (tick + bldg.x) % 4 < 2;
          grid[topRow - 1][antennaCol] = { ch: blinkOn ? "·" : " ", fg: "#ED8796" };
        }
      }
    }
  }

  // ── Moon — clean circle using box-drawing, appears at 5% ──
  if (progress > 0.05) {
    const mx = 52;
    const my = 2;
    const moonProgress = Math.min((progress - 0.05) / 0.2, 1);
    const pulse = tick % 6;
    const mc = pulse < 2 ? MOON : pulse < 4 ? MOON_GLOW : MOON_DIM;

    if (moonProgress > 0.2) {
      //  Clean round moon using box chars:
      //
      //    ╭───╮
      //   │  ·  │
      //   │     │
      //    ╰───╯
      //
      const set = (r: number, c: number, ch: string, fg: string) => {
        if (r >= 0 && r < SKYLINE_BASE - 2 && c >= 0 && c < ART_W) {
          grid[r][c] = { ch, fg };
        }
      };

      // Top arc
      set(my, mx + 1, "╭", mc);
      set(my, mx + 2, "─", mc);
      set(my, mx + 3, "─", mc);
      set(my, mx + 4, "─", mc);
      set(my, mx + 5, "╮", mc);
      // Middle rows
      set(my + 1, mx, "│", mc);
      set(my + 1, mx + 2, "·", MOON_GLOW);
      set(my + 1, mx + 6, "│", mc);
      set(my + 2, mx, "│", mc);
      set(my + 2, mx + 6, "│", mc);
      // Bottom arc
      set(my + 3, mx + 1, "╰", mc);
      set(my + 3, mx + 2, "─", mc);
      set(my + 3, mx + 3, "─", mc);
      set(my + 3, mx + 4, "─", mc);
      set(my + 3, mx + 5, "╯", mc);

      // Glow halo — pulsing dots around
      if (moonProgress > 0.5) {
        const glow: [number, number][] = [
          [-1, 2], [-1, 3], [-1, 4],
          [0, -1], [1, -1], [2, -1], [3, -1],
          [0, 7], [1, 7], [2, 7], [3, 7],
          [4, 2], [4, 3], [4, 4],
        ];
        for (const [dy, dx] of glow) {
          const r = my + dy;
          const c = mx + dx;
          if (r >= 0 && r < SKYLINE_BASE - 2 && c >= 0 && c < ART_W && grid[r][c].ch === " ") {
            if ((tick + r + c) % 5 < 2) grid[r][c] = { ch: "·", fg: MOON_DIM };
          }
        }
      }
    }
  }

  // ── Stars — twinkle, different types ──
  const starDensity = Math.min(progress * 3, 1);
  for (let r = 0; r < SKYLINE_BASE - 2; r++) {
    for (let c = 0; c < ART_W; c++) {
      if (grid[r][c].ch !== " ") continue;
      const seed = hash(c, r);
      const starThreshold = seed % 100;
      if (starThreshold < starDensity * 10) {
        const twinkleCycle = (tick + seed) % 8;
        const starType = seed % 5;

        if (starType === 0) {
          // Big star — ✦
          if (twinkleCycle < 2) grid[r][c] = { ch: "✦", fg: STAR_BRIGHT };
          else if (twinkleCycle < 4) grid[r][c] = { ch: "✦", fg: STAR_DIM };
          else if (twinkleCycle < 6) grid[r][c] = { ch: "·", fg: STAR_DIM };
          else grid[r][c] = { ch: "✦", fg: STAR_BRIGHT };
        } else if (starType === 1) {
          // Cross star — +
          if (twinkleCycle < 2) grid[r][c] = { ch: "+", fg: STAR_BRIGHT };
          else if (twinkleCycle < 5) grid[r][c] = { ch: "·", fg: STAR_DIM };
          else grid[r][c] = { ch: "+", fg: STAR_DIM };
        } else {
          // Dot star — ·
          if (twinkleCycle < 2) grid[r][c] = { ch: "·", fg: STAR_BRIGHT };
          else if (twinkleCycle < 4) grid[r][c] = { ch: "·", fg: STAR_DIM };
          else if (twinkleCycle < 6) grid[r][c] = { ch: " ", fg: SKY };
          else grid[r][c] = { ch: "·", fg: STAR_OFF };
        }
      }
    }
  }

  // ── Shooting stars — streak across sky ──
  if (progress > 0.15) {
    // A shooting star appears every ~8 ticks, lasts 3 ticks
    const shootCycle = Math.floor(tick / 8);
    const shootPhase = tick % 8;
    if (shootPhase < 3) {
      const seed = hash(shootCycle, 9999);
      const startX = seed % (ART_W - 15);
      const startY = seed % 4;
      for (let i = 0; i < 4 - shootPhase; i++) {
        const sx = startX + shootPhase * 3 + i;
        const sy = startY + Math.floor((shootPhase * 3 + i) / 3);
        if (sx >= 0 && sx < ART_W && sy >= 0 && sy < SKYLINE_BASE - 3 && grid[sy][sx].ch === " ") {
          const brightness = i === 0 ? STAR_BRIGHT : i === 1 ? SHOOTING : STAR_DIM;
          grid[sy][sx] = { ch: i === 0 ? "★" : i === 1 ? "·" : "·", fg: brightness };
        }
      }
    }
  }

  // ── Wispy clouds — drift slowly, appear at 20% ──
  if (progress > 0.2) {
    const numClouds = Math.min(Math.floor((progress - 0.2) * 6), 3);
    for (let ci = 0; ci < numClouds; ci++) {
      const cloudY = 2 + ci * 2;
      // Clouds drift left slowly
      const cloudX = ((70 - tick + ci * 25) % (ART_W + 15)) - 8;
      const cloudPulse = (tick + ci) % 4 < 2 ? CLOUD_BRIGHT : CLOUD;

      const cloudShape = ci % 2 === 0
        ? ["  .--.  ", " /    \\ ", "'------'"]
        : [" .--. ", "/    \\", "'----'"];

      for (let row = 0; row < cloudShape.length; row++) {
        const cr = cloudY + row;
        if (cr < 0 || cr >= SKYLINE_BASE - 3) continue;
        for (let col = 0; col < cloudShape[row].length; col++) {
          const cc = cloudX + col;
          if (cc < 0 || cc >= ART_W) continue;
          const ch = cloudShape[row][col];
          if (ch !== " " && grid[cr][cc].ch === " ") {
            grid[cr][cc] = { ch, fg: cloudPulse };
          }
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
  previewStages.push(generateCity(i / (NUM_STAGES - 1), 5));
}

export const cityTheme: ArtTheme = {
  name: "City Skyline",
  stages: previewStages,
  generate: generateCity,
};
