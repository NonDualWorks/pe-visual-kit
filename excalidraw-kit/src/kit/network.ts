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
