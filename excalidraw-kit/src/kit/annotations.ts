// Annotations: small facts attached to anything.
import { C, Style, base, rect, label } from "./core.js";

// Badge: a pill. Tone = neutral (facts), ok (good news), warn (needs attention).
export function badge(s: Style, tone: "neutral" | "ok" | "warn", str: string) {
  const c = tone === "ok" ? C.passed : tone === "warn" ? C.pending : { stroke: C.neutral.stroke, bg: C.neutral.bg };
  const b = rect(0, 0, Math.max(90, str.length * 9 + 24), 30, s, { strokeColor: c.stroke, backgroundColor: c.bg, strokeWidth: 1 });
  return [b, label(b, str, 14, s)];
}

// Step number: a filled circle for walkthroughs (①②③). Double-click to change the number.
export function step(s: Style, n = 1) {
  const c = base("ellipse", 0, 0, 38, 38, s, { strokeColor: "#1e1e1e", backgroundColor: "#343a40" });
  return [c, label(c, String(n), 18, s, "center", { strokeColor: "#ffffff" })];
}
