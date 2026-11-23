// Testing: what checks a change. Amber hexagon = a test suite (diamonds are already gates).
import { C, Style, State, base, line, rect, text, label, group } from "./core.js";

const AMBER = { stroke: "#e67700", bg: "#ffe8a3" };

// Test suite: hexagon with a short id (T01…) and its kind. Lives in the PR namespace.
// e2e = true: an end-to-end suite that runs outside the cluster (dashed, like a real client).
export function testSuite(s: Style, id = "T01", kind = "api", e2e = false) {
  const w = 120, h = 100, k = 30;
  const hex = line(0, 0, [[k, 0], [w - k, 0], [w, h / 2], [w - k, h], [k, h], [0, h / 2], [k, 0]], s, {
    strokeColor: AMBER.stroke, backgroundColor: AMBER.bg, fillStyle: "solid", polygon: true,
    strokeStyle: e2e ? "dashed" : "solid",
  });
  return group([
    hex,
    text(id, w / 2 - id.length * 6.6, 24, 22, s, { strokeColor: AMBER.stroke }),
    text(kind, w / 2 - kind.length * 4.2, 58, 14, s, { strokeColor: "#1e1e1e" }),
  ]);
}

// Test result: a pill with the outcome. passed / blocked (= failed) / pending (= running).
export function testResult(s: Style, state: State) {
  const str = state === "passed" ? "✓ 42 passed" : state === "blocked" ? "✗ 3 failed" : "⟳ running";
  const b = rect(0, 0, 130, 32, s, { strokeColor: C[state].stroke, backgroundColor: C[state].bg, strokeWidth: 1.5 });
  return [b, label(b, str, 15, s)];
}
