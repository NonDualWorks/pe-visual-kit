// Annotations: small facts attached to anything.
import { C, Style, rect, label } from "./core.js";

// Badge: a pill. Tone = neutral (facts), ok (good news), warn (needs attention).
export function badge(s: Style, tone: "neutral" | "ok" | "warn", str: string) {
  const c = tone === "ok" ? C.passed : tone === "warn" ? C.pending : { stroke: C.neutral.stroke, bg: C.neutral.bg };
  const b = rect(0, 0, Math.max(90, str.length * 9 + 24), 30, s, { strokeColor: c.stroke, backgroundColor: c.bg, strokeWidth: 1 });
  return [b, label(b, str, 14, s)];
}
