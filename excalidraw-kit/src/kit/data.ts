// Data: where state lives.
import { C, Style, base, rect, line, text, label, group } from "./core.js";

// Database cylinder: top ellipse + two sides + round bottom. Dashed = ephemeral.
export function database(s: Style, title: string, ephemeral: boolean) {
  const w = 170, body = 90, eh = 26;
  const st = { strokeColor: C.neutral.stroke, strokeStyle: ephemeral ? "dashed" : "solid" };
  // bottom arc: points along the lower half of an ellipse, so it reads as a round base
  const arc = Array.from({ length: 9 }, (_, i) => [(w * i) / 8, (eh / 2) * Math.sin((Math.PI * i) / 8)]);
  return group([
    base("ellipse", 0, 0, w, eh, s, { ...st, backgroundColor: C.neutral.bg }),
    line(0, eh / 2, [[0, 0], [0, body]], s, st),
    line(w, eh / 2, [[0, 0], [0, body]], s, st),
    line(0, eh / 2 + body, arc, s, st, true),
    text(title, w / 2 - 75, eh + 22, 16, s, { width: 150, textAlign: "center" }),
  ]);
}

// ---------- Relational ----------

// Schema: a box that sits inside/under a database. Dashed = per-PR (ephemeral).
export function schema(s: Style, name: string, ephemeral = false) {
  const b = rect(0, 0, 150, 40, s, { strokeColor: C.neutral.stroke, backgroundColor: "#ffffff",
    strokeStyle: ephemeral ? "dashed" : "solid", strokeWidth: 1.5 });
  return [b, label(b, name, 15, s)];
}

// Tagged rows: a mini table where one row belongs to a PR (L3 · shared schema, rows tagged).
export function taggedRows(s: Style) {
  const rows = [["id", "pr"], ["1041", "—"], ["1042", "pr-482"], ["1043", "—"]];
  return group(rows.flatMap(([a, b], i) => {
    const pr = b === "pr-482";
    const r = rect(0, i * 26, 170, 26, s, { roundness: null, strokeWidth: 1, strokeColor: C.neutral.stroke,
      backgroundColor: i === 0 ? C.neutral.bg : pr ? C.app.bg : "#ffffff" });
    return [r, text(a, 10, i * 26 + 4, 14, s, { fontFamily: s.monoFamily }), text(b, 90, i * 26 + 4, 14, s, { fontFamily: s.monoFamily, strokeColor: pr ? C.app.stroke : "#1e1e1e" })];
  }));
}

// ---------- Messages ----------

// Topic / queue: a log of message slots. Dashed = per-PR (ephemeral).
export function messageLog(s: Style, name: string, ephemeral = false) {
  const st = { strokeColor: C.neutral.stroke, strokeStyle: ephemeral ? "dashed" : "solid" };
  const box = rect(0, 0, Math.max(200, 120 + name.length * 9), 44, s, { ...st, backgroundColor: C.neutral.light, roundness: { type: 3 } });
  const slots = [0, 1, 2, 3].map((i) => rect(12 + i * 22, 10, 16, 24, s, { ...st, strokeWidth: 1, backgroundColor: "#ffffff", roundness: null }));
  return group([box, ...slots, text(name, 108, 13, 15, s, { fontFamily: s.monoFamily })]);
}

// Message: an envelope with an optional routing tag (pr-482).
export function message(s: Style, tag?: string) {
  const env = rect(0, 0, 54, 36, s, { strokeColor: C.neutral.stroke, backgroundColor: "#ffffff", roundness: null });
  const flap = line(0, 0, [[0, 0], [27, 18], [54, 0]], s, { strokeColor: C.neutral.stroke, strokeWidth: 1.5 });
  if (!tag) return group([env, flap]);
  const t = rect(40, -14, tag.length * 9 + 16, 24, s, { strokeColor: C.app.stroke, backgroundColor: C.app.bg, strokeWidth: 1 });
  return group([env, flap, t, label(t, tag, 13, s)]);
}
