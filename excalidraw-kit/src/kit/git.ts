// Git: the metaphor for how our environments behave (branch = feature env, push = promote, rebase = sync).
import { C, Style, base, line, text, rect, label, group } from "./core.js";

export function commit(s: Style, kind: "normal" | "merge" | "branch" = "normal") {
  const big = kind === "merge";
  const color = kind === "branch" ? C.app.stroke : "#343a40";
  return [base("ellipse", 0, 0, big ? 22 : 16, big ? 22 : 16, s, {
    strokeColor: color, backgroundColor: kind === "merge" ? C.passed.bg : "#ffffff", strokeWidth: 2.5 })];
}

// Main line with a few commits and its name. Resize by dragging the line's end.
export function mainLine(s: Style, name = "master", length = 560) {
  const l = line(0, 0, [[0, 0], [length, 0]], s, { strokeColor: "#343a40", strokeWidth: 3 });
  const dots = [0.12, 0.45, 0.78].map((f) => commit(s)[0]).map((d, i) => { d.x = [0.12, 0.45, 0.78][i] * length - 8; d.y = -8; return d; });
  return group([l, ...dots, text(name, 0, -34, 16, s, { fontFamily: s.monoFamily, strokeColor: C.muted })]);
}

// Feature branch: leaves the main line, two commits, named after its env.
export function branch(s: Style, name = "f03") {
  const st = { strokeColor: C.app.stroke, strokeWidth: 3 };
  const l = line(0, 0, [[0, 0], [30, 50], [220, 50]], s, st, true);
  const dots = [110, 190].map((x) => { const d = commit(s, "branch")[0]; d.x = x - 8; d.y = 42; return d; });
  return group([l, ...dots, text(name, 120, 64, 16, s, { fontFamily: s.monoFamily, strokeColor: C.app.stroke })]);
}

export function gitTag(s: Style, name = "product/v5.3.0") {
  const b = rect(0, 0, name.length * 9 + 40, 30, s, { strokeColor: "#343a40", backgroundColor: C.neutral.bg, strokeWidth: 1 });
  return [b, label(b, "🏷 " + name, 14, s)];
}

// Developer laptop: the "local" side of the git metaphor.
export function laptop(s: Style, branchName = "feat-482") {
  const screen = rect(0, 0, 200, 110, s, { strokeColor: "#343a40", backgroundColor: "#ffffff" });
  const baseBar = rect(-16, 110, 232, 14, s, { strokeColor: "#343a40", backgroundColor: C.neutral.bg, roundness: null });
  return group([screen, baseBar, text("dev laptop", 14, 12, 16, s, { strokeColor: C.muted }), text("branch: " + branchName, 14, 44, 16, s, { fontFamily: s.monoFamily, strokeColor: C.app.stroke }), text("seconds to rebase", 14, 76, 14, s, { strokeColor: C.passed.stroke })]);
}

// Pull request card: number, service it changes, branch.
export function pullRequest(s: Style, n = "482", svc = "a04", br = "feat-482") {
  const box = rect(0, 0, 220, 96, s, { strokeColor: C.app.stroke, backgroundColor: "#ffffff" });
  return group([box, text(`⑂ PR #${n}`, 14, 10, 20, s, { strokeColor: C.app.stroke }),
    text(`changes: ${svc}`, 14, 42, 15, s), text(`branch: ${br}`, 14, 66, 14, s, { fontFamily: s.monoFamily, strokeColor: C.muted })]);
}
