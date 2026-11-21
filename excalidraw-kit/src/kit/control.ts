// Control: who or what decides.
import { C, Style, State, base, rect, text, label, group } from "./core.js";

// Gate: diamond marker + label beside it. Glyph = who decides (⚙ automated, 👤 human). Color = state.
export function gate(s: Style, who: "automated" | "human", state: State, name: string) {
  const c = C[state];
  const d = base("diamond", 0, 0, 48, 48, s, { strokeColor: c.stroke, backgroundColor: c.bg });
  return group([d, label(d, who === "human" ? "👤" : "⚙", 18, s), text(name, 58, 13, 18, s)]);
}

// Threshold bar: three zones (free / nudge / must). Works for skew windows, error budgets, SLOs.
export function thresholdBar(s: Style) {
  const zones: [string, State][] = [["0–2 behind · free", "passed"], ["3–5 · nudge", "pending"], ["6+ · must sync", "blocked"]];
  return group(zones.flatMap(([t, st], i) => {
    const b = rect(i * 170, 0, 170, 40, s, { strokeColor: C[st].stroke, backgroundColor: C[st].bg, roundness: null });
    return [b, label(b, t, 15, s)];
  }));
}
