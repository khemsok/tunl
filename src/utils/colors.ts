type RGB = [number, number, number];

export function interpolateColor(color1: RGB, color2: RGB, t: number): string {
  const r = Math.round(color1[0] + (color2[0] - color1[0]) * t);
  const g = Math.round(color1[1] + (color2[1] - color1[1]) * t);
  const b = Math.round(color1[2] + (color2[2] - color1[2]) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const STOPS: { at: number; color: RGB }[] = [
  { at: 0, color: [138, 173, 244] },
  { at: 0.25, color: [127, 219, 202] },
  { at: 0.5, color: [166, 218, 149] },
  { at: 0.75, color: [238, 212, 159] },
  { at: 1, color: [245, 169, 127] },
];

export function getGradientColor(progress: number): string {
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (progress <= STOPS[i + 1].at) {
      const t = (progress - STOPS[i].at) / (STOPS[i + 1].at - STOPS[i].at);
      return interpolateColor(STOPS[i].color, STOPS[i + 1].color, t);
    }
  }
  return interpolateColor(
    STOPS[STOPS.length - 2].color,
    STOPS[STOPS.length - 1].color,
    1,
  );
}
