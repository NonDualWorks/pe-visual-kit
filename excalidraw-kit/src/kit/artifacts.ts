// Artifacts: what gets shipped. Manifests compose into a release.
import { C, Style, El, base, rect, text, line, label, group } from "./core.js";

// Manifest: a document with a folded corner, a header (name · version) and component lines.
export type ManifestSpec = { title: string; lines: string[]; color: { stroke: string; light: string }; dashed?: boolean };
export function manifest(s: Style, m: ManifestSpec): El[] {
  const w = 230, h = 52 + m.lines.length * 22, fold = 16;
  const st = { strokeColor: m.color.stroke, strokeStyle: m.dashed ? "dashed" : "solid" };
  return group([
    rect(0, 0, w, h, s, { ...st, backgroundColor: m.color.light, roundness: null }),
    // folded corner: a small filled triangle in the top-right
    line(w - fold, 0, [[0, 0], [0, fold], [fold, fold], [0, 0]], s, { ...st, backgroundColor: "#ffffff" }),
    text(m.title, 12, 10, 16, s, { strokeColor: m.color.stroke }),
    line(12, 36, [[0, 0], [w - 24, 0]], s, { ...st, strokeWidth: 1 }),
    text(m.lines.join("\n"), 12, 44, 14, s, { fontFamily: s.monoFamily, lineHeight: 1.57 }),
  ]);
}

export const MANIFESTS: [string, ManifestSpec][] = [
  ["platform", { title: "platform manifest · 2.4.3", lines: ["ledger: 2.5.1", "identity: 5.2.0", "+18 more"], color: C.platform }],
  ["app", { title: "app manifest · 7.1.0", lines: ["platform: 2.4.x", "checkout: 7.1.0", "invoicing: 3.0.2", "+25 more"], color: C.app }],
  ["overlay", { title: "overlay · f03", lines: ["checkout: feat-482"], color: C.neutral, dashed: true }],
];

// Release: a resolved, pinned, tagged manifest. Immutable, hence the lock.
export const release = (s: Style) =>
  manifest(s, { title: "🔒 product/v5.3.0", lines: ["platform: 2.4.3", "app: 7.1.0", "images @sha256 digests"], color: { stroke: "#343a40", light: C.neutral.bg } });

// Compose: the "+" point where sub-manifests join.
export function compose(s: Style) {
  const o = base("ellipse", 0, 0, 52, 52, s, { strokeColor: C.neutral.stroke, backgroundColor: "#ffffff" });
  return [o, label(o, "+", 26, s)];
}

// Resolve · pin · tag: turns a composed manifest (with ranges like 2.4.x) into a release.
export function resolveStep(s: Style) {
  const b = rect(0, 0, 190, 56, s, { strokeColor: C.neutral.stroke, backgroundColor: "#ffffff" });
  return [b, label(b, "resolve · pin · tag", 16, s)];
}
