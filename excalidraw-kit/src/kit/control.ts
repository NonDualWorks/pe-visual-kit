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

// Sandbox infra: what the pipeline creates for one PR. Routing rule always; DB and queues only when the change needs them.
export function sandboxInfra(s: Style, pr = "pr-482", db = true, queues = true) {
  const box = rect(0, 0, 270, 130, s, { strokeColor: C.neutral.stroke, backgroundColor: "#ffffff", strokeStyle: "dashed" });
  const row = (y: number, on: boolean, t: string) => text(`${on ? "☑" : "☐"} ${t}`, 16, y, 16, s, { strokeColor: on ? "#1e1e1e" : C.muted });
  return group([box, text(`sandbox infra · ${pr}`, 16, 12, 17, s, { strokeColor: C.neutral.stroke }),
    row(46, true, "routing rule  (always)"), row(72, db, "PR DB  (if DDL)"), row(98, queues, "queues  (if events)")]);
}

// TTL: backup cleanup timer on anything ephemeral.
export function ttl(s: Style, str = "TTL 48h after last push") {
  const b = rect(0, 0, str.length * 8.4 + 44, 32, s, { strokeColor: C.pending.stroke, backgroundColor: "#fff4e6", strokeWidth: 1.5, strokeStyle: "dashed" });
  return [b, label(b, "⏳ " + str, 14, s)];
}
