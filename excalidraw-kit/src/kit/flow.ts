// Flow: how changes move between places.
import { C, Style, rect, label, arrow } from "./core.js";

// Arrow kinds. Line style = kind of move (solid promote/deploy, dashed sync, dotted back-merge).
// Color = how it feels: amber = imposed (forced sync), green = chosen (pull).
export const FLOWS = {
  promote:     { strokeColor: "#1e1e1e", strokeStyle: "solid", caption: "promote" },
  syncForced:  { strokeColor: C.pending.stroke, strokeStyle: "dashed", caption: "sync (forced)" },
  syncPull:    { strokeColor: C.passed.stroke, strokeStyle: "dashed", caption: "pull" },
  backMerge:   { strokeColor: C.neutral.stroke, strokeStyle: "dotted", caption: "back-merge" },
  deploy:      { strokeColor: "#1e1e1e", strokeStyle: "solid", caption: "deploy" },
  // requests (runtime traffic), not changes
  request:     { strokeColor: C.muted, strokeStyle: "solid", caption: "request" },
  requestTagged: { strokeColor: C.app.stroke, strokeStyle: "solid", caption: "sandbox=pr-482" },
  push:        { strokeColor: "#1e1e1e", strokeStyle: "solid", caption: "git push" },
};
export type FlowKind = keyof typeof FLOWS;

// An arrow of a given kind from (0,0) to (dx,dy). caption=null for no label.
export function flow(s: Style, kind: FlowKind, dx = 220, dy = 0, caption: string | null = FLOWS[kind].caption) {
  const { caption: _c, ...st } = FLOWS[kind];
  return arrow(dx, dy, s, st, caption ?? undefined);
}

// CD system: the tool that takes a release and deploys it.
export function cdSystem(s: Style) {
  const b = rect(0, 0, 190, 64, s, { strokeColor: "#343a40", backgroundColor: C.neutral.bg, roundness: null });
  return [b, label(b, "CD\nJenkins / Concourse", 16, s)];
}
