// Network & mesh: how things are connected.
import { C, Style, rect, label } from "./core.js";

// Mesh boundary: translucent overlay. Make it bigger than the namespaces it covers, then "Send to back".
export function meshBoundary(s: Style) {
  const box = rect(0, 0, 840, 360, s, {
    strokeColor: C.mesh.stroke, backgroundColor: C.mesh.bg, fillStyle: s.meshFill,
    strokeStyle: "dotted", opacity: 45,
  });
  return [box, label(box, "mesh: istio", 20, s, "top-left")];
}

export function controlPlane(s: Style) {
  const box = rect(0, 0, 180, 70, s, { strokeColor: C.mesh.stroke, backgroundColor: C.mesh.light });
  return [box, label(box, "istiod\ncontrol plane", 16, s)];
}

// Routing rule: what the mesh does with the routing key. One per sandbox (or per service candidate).
export function routingRule(s: Style, key = "sandbox=pr-482", target = "a04′ (ns pr-482)") {
  const box = rect(0, 0, 250, 62, s, { strokeColor: C.mesh.stroke, backgroundColor: C.mesh.light, strokeStyle: "dashed" });
  return [box, label(box, `match ${key}\n→ ${target}`, 15, s, "center", { fontFamily: s.monoFamily })];
}

// Ingress gateway: where outside callers (e2e suites, real clients) enter the mesh.
export function ingressGateway(s: Style) {
  const box = rect(0, 0, 150, 80, s, { strokeColor: C.mesh.stroke, backgroundColor: C.mesh.bg });
  return [box, label(box, "istio\ningress gateway", 15, s)];
}
