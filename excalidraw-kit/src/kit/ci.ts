// CI · Concourse: the developer's harness. Boxes and colors follow Concourse's own UI,
// so the picture looks like what developers will see.
import { Style, rect, line, text, label, group, base } from "./core.js";

export type JobState = "pending" | "started" | "succeeded" | "failed";
const JOB: Record<JobState, { bg: string; fg: string }> = {
  pending:   { bg: "#9b9b9b", fg: "#ffffff" },
  started:   { bg: "#fad43b", fg: "#1e1e1e" },
  succeeded: { bg: "#11c560", fg: "#ffffff" },
  failed:    { bg: "#ed4b35", fg: "#ffffff" },
};
const RES = { bg: "#3d3c3c", fg: "#ffffff" };

export function job(s: Style, name: string, state: JobState, w = 170) {
  const b = rect(0, 0, w, 44, s, { strokeColor: "#1e1e1e", backgroundColor: JOB[state].bg, roundness: null, strokeWidth: 1 });
  return [b, label(b, name, 15, s, "center", { strokeColor: JOB[state].fg, fontFamily: s.monoFamily })];
}

export function resource(s: Style, name: string, w = 150) {
  const b = rect(0, 0, w, 34, s, { strokeColor: "#1e1e1e", backgroundColor: RES.bg, roundness: null, strokeWidth: 1 });
  return [b, label(b, name, 14, s, "center", { strokeColor: RES.fg, fontFamily: s.monoFamily })];
}

// Rerun button: Concourse's "+" (trigger a new build of this job).
export function rerun(s: Style) {
  const c = base("ellipse", 0, 0, 34, 34, s, { strokeColor: "#1e1e1e", backgroundColor: "#ffffff", strokeWidth: 1.5 });
  return [c, label(c, "+", 20, s)];
}

const at = (els: any[], x: number, y: number) => { els.forEach((e) => { e.x += x; e.y += y; }); return els; };
const wire = (s: Style, x1: number, y1: number, x2: number, y2: number) =>
  line(x1, y1, [[0, 0], [(x2 - x1) / 2, 0], [(x2 - x1) / 2, y2 - y1], [x2 - x1, y2 - y1]], s, { strokeColor: "#868e96", strokeWidth: 1.5 });

// A whole PR pipeline: pr resource → dockerize & publish → create sandbox infra → deploy → suites.
// outcome decides the colors: "passing", "test-failed", "deploy-failed".
export function prPipeline(s: Style, outcome: "passing" | "test-failed" | "deploy-failed" = "passing", pr = "482", svc = "a04′") {
  const deployOk = outcome !== "deploy-failed";
  const st = (ok: boolean): JobState => (deployOk ? (ok ? "succeeded" : "failed") : "pending");
  const els: any[] = [];
  const hdr = text(`pr-sandbox  /  pr:${pr}`, 0, 0, 18, s, { fontFamily: s.monoFamily, strokeColor: "#495057" });
  els.push(hdr);
  const Y = 120;
  els.push(...at(resource(s, `pr-${pr} (git)`), 0, Y + 5));
  els.push(...at(job(s, "dockerize & publish", "succeeded", 200), 200, Y));
  els.push(...at(job(s, "create sandbox infra", "succeeded", 210), 450, Y));
  els.push(...at(job(s, `deploy ${svc}`, deployOk ? "succeeded" : "failed", 160), 710, Y));
  const suites: [string, boolean][] = [["T01 contract", true], ["T02 api", outcome !== "test-failed"], ["E01 e2e", true]];
  suites.forEach(([n, ok], i) => els.push(...at(job(s, n, st(ok), 150), 930, Y - 60 + i * 60)));
  els.push(wire(s, 150, Y + 22, 200, Y + 22), wire(s, 400, Y + 22, 450, Y + 22), wire(s, 660, Y + 22, 710, Y + 22));
  suites.forEach((_, i) => els.push(wire(s, 870, Y + 22, 930, Y - 38 + i * 60)));
  // teardown runs on its own trigger
  els.push(...at(resource(s, "pr closed · ttl", 170), 0, Y + 140), ...at(job(s, "teardown", "pending", 150), 220, Y + 135));
  els.push(wire(s, 170, Y + 157, 220, Y + 157));
  return group(els);
}
