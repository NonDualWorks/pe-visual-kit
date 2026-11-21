// core: styles, colors and the tiny element factory every component uses.

// ---------- styles: the only difference between the sketchy and clean files ----------
export type Style = { name: string; roughness: number; fontFamily: number; monoFamily: number; meshFill: string };
export const STYLES: Style[] = [
  { name: "sketchy", roughness: 1, fontFamily: 5, monoFamily: 8, meshFill: "hachure" }, // Excalifont + Comic Shanns
  { name: "clean",   roughness: 0, fontFamily: 6, monoFamily: 3, meshFill: "solid" },   // Nunito + Cascadia
];

// ---------- colors: shape = what it is, color = who owns it / state, dashed = ephemeral ----------
export const C = {
  platform: { stroke: "#0c8599", bg: "#c3fae8", light: "#e6fcf5" }, // teal
  app:      { stroke: "#6741d9", bg: "#e5dbff", light: "#f3f0ff" }, // purple
  neutral:  { stroke: "#495057", bg: "#f1f3f5", light: "#f8f9fa" }, // gray
  mesh:     { stroke: "#1971c2", bg: "#a5d8ff", light: "#e7f5ff" }, // blue: mesh-owned things
  frame:    { stroke: "#868e96", bg: "transparent" },
  muted: "#868e96",
  // states (gates, badges, threshold bar)
  pending: { stroke: "#e8590c", bg: "#ffec99" },
  passed:  { stroke: "#2f9e44", bg: "#b2f2bb" },
  blocked: { stroke: "#e03131", bg: "#ffc9c9" },
};
export type Owner = "platform" | "app";
export type State = "pending" | "passed" | "blocked";

// ---------- element factory ----------
export type El = Record<string, any>;
let counter = 0;
let rnd = 7; // deterministic seeds → re-running gives identical files (clean git diffs)
const nextSeed = () => (rnd = (rnd * 48271) % 2147483647);
const newId = (p: string) => `${p}-${(++counter).toString(36)}`;

export function base(type: string, x: number, y: number, w: number, h: number, s: Style, extra: El = {}): El {
  return {
    id: newId(type), type, x, y, width: w, height: h, angle: 0,
    strokeColor: "#1e1e1e", backgroundColor: "transparent", fillStyle: "solid",
    strokeWidth: 2, strokeStyle: "solid", roughness: s.roughness, opacity: 100,
    groupIds: [], frameId: null, roundness: null, seed: nextSeed(), version: 1,
    versionNonce: nextSeed(), isDeleted: false, boundElements: null, updated: 1,
    link: null, locked: false, ...extra,
  };
}

export const rect = (x: number, y: number, w: number, h: number, s: Style, extra: El = {}) =>
  base("rectangle", x, y, w, h, s, { roundness: { type: 3 }, ...extra });

// Free text. Sizes are estimates; Excalidraw re-measures on load.
export function text(str: string, x: number, y: number, size: number, s: Style, opts: El = {}): El {
  const lines = str.split("\n");
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.6;
  const h = lines.length * size * 1.25;
  return base("text", x, y, w, h, s, {
    text: str, originalText: str, fontSize: size, fontFamily: s.fontFamily,
    textAlign: "left", verticalAlign: "top", containerId: null,
    lineHeight: 1.25, autoResize: true, strokeColor: "#1e1e1e", ...opts,
  });
}

// Text bound to a box/diamond/ellipse/arrow: it moves and resizes with it.
export function label(box: El, str: string, size: number, s: Style, align: "center" | "top-left" = "center", opts: El = {}): El {
  const t = text(str, 0, 0, size, s, { containerId: box.id, strokeColor: box.strokeColor, textAlign: "center", verticalAlign: "middle", ...opts });
  if (box.type === "arrow") {
    const [dx, dy] = box.points[box.points.length - 1];
    t.x = box.x + dx / 2 - t.width / 2;
    t.y = box.y + dy / 2 - t.height / 2;
  } else if (align === "center") {
    t.x = box.x + (box.width - t.width) / 2;
    t.y = box.y + (box.height - t.height) / 2;
  } else {
    Object.assign(t, { x: box.x + 12, y: box.y + 10, textAlign: "left", verticalAlign: "top" });
  }
  box.boundElements = [...(box.boundElements ?? []), { type: "text", id: t.id }];
  return t;
}

// A line through points (relative to x,y). round=true makes a smooth curve.
export function line(x: number, y: number, pts: number[][], s: Style, extra: El = {}, round = false): El {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return base("line", x, y, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), s, {
    points: pts, lastCommittedPoint: null, startBinding: null, endBinding: null,
    startArrowhead: null, endArrowhead: null, roundness: round ? { type: 2 } : null, ...extra,
  });
}

// A straight arrow from (0,0) to (dx,dy), with an optional label riding on it.
export function arrow(dx: number, dy: number, s: Style, extra: El = {}, caption?: string): El[] {
  const a = base("arrow", 0, 0, Math.abs(dx), Math.abs(dy), s, {
    points: [[0, 0], [dx, dy]], lastCommittedPoint: null, startBinding: null, endBinding: null,
    startArrowhead: null, endArrowhead: "arrow", roundness: { type: 2 }, elbowed: false, ...extra,
  });
  return caption ? [a, label(a, caption, 14, s)] : [a];
}

// Put all elements of a multi-part component into one group so they move as one.
export function group(els: El[]): El[] {
  const g = newId("group");
  els.forEach((e) => (e.groupIds = [...e.groupIds, g]));
  return els;
}

// Big labelled box to nest things in (region, cluster, namespace).
export function frame(s: Style, w: number, h: number, title: string, color: { stroke: string; bg: string }, extra: El = {}) {
  const box = rect(0, 0, w, h, s, { strokeColor: color.stroke, backgroundColor: color.bg, ...extra });
  return [box, label(box, title, 20, s, "top-left")];
}
