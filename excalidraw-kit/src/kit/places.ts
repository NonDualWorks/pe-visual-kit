// Places: where things run.
import { C, Style, El, Owner, rect, text, group, frame } from "./core.js";

export const region = (s: Style) => frame(s, 980, 620, "AWS · us-east-1", C.frame);
export const cluster = (s: Style) => frame(s, 900, 520, "EKS · eks-dev", { stroke: "#343a40", bg: "transparent" }); // transparent: a mesh behind it stays visible
export const nsBaseline = (s: Style) => frame(s, 400, 280, "ns: baseline", { stroke: C.neutral.stroke, bg: "#ffffff" });
export const nsSandbox = (s: Style) =>
  frame(s, 400, 280, "ns: pr-482 · sandbox", { stroke: C.neutral.stroke, bg: "#ffffff" }, { strokeStyle: "dashed" });

// Environment card: one card for every kind of environment.
// Name · kind · contents · status. Stroke color = owner (app purple, platform teal, shared gray).
export type EnvSpec = { name: string; kind: string; contents?: string; status: string; owner?: Owner; statusColor?: string };
export function envCard(s: Style, e: EnvSpec): El[] {
  const stroke = e.owner ? C[e.owner].stroke : C.neutral.stroke;
  const box = rect(0, 0, 230, 116, s, { strokeColor: stroke, backgroundColor: "#ffffff" });
  return group([
    box,
    text(e.name, 14, 10, 24, s, { strokeColor: stroke }),
    text(e.kind, 14, 44, 14, s, { strokeColor: C.muted }),
    text(e.contents ?? "50 svcs + DB", 14, 66, 14, s),
    text(e.status, 14, 88, 14, s, { strokeColor: e.statusColor ?? C.passed.stroke }),
  ]);
}

export const ENVS: [string, EnvSpec][] = [
  ["feature (app) f03", { name: "f03", kind: "feature env · app", status: "up to date", owner: "app" }],
  ["feature (platform) p02", { name: "p02", kind: "feature env · platform", status: "up to date", owner: "platform" }],
  ["hotfix hf1", { name: "hf1", kind: "hotfix env", status: "based on product/v5.2.0", statusColor: C.muted }],
  ["CI", { name: "ci", kind: "CI env · shared", status: "master @ 3f9c2ab", statusColor: C.muted }],
  ["pre-prod", { name: "pre-prod", kind: "pinned release", status: "product/v5.3.0", statusColor: C.muted }],
  ["prod", { name: "prod", kind: "production", status: "product/v5.2.0", statusColor: C.muted }],
];
