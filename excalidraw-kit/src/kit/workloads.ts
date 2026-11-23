// Workloads: what runs.
import { C, Style, Owner, rect, label, group } from "./core.js";

// One microservice (a "component"). Drop as many as you need; double-click to rename.
export function service(s: Style, owner: Owner, name = owner === "platform" ? "p01" : "a04", ephemeral = false) {
  const box = rect(0, 0, 160, 64, s, { strokeColor: C[owner].stroke, backgroundColor: C[owner].bg, strokeStyle: ephemeral ? "dashed" : "solid" });
  return [box, label(box, name, 20, s)];
}

// Service with an Istio sidecar tab on its right edge.
export function serviceWithSidecar(s: Style, owner: Owner, name?: string, ephemeral = false) {
  const [box, t] = service(s, owner, name, ephemeral);
  const tab = rect(154, 17, 60, 30, s, { strokeColor: C.mesh.stroke, backgroundColor: C.mesh.bg });
  return group([box, t, tab, label(tab, "envoy", 14, s)]);
}

// "Everything else" in a namespace: stacked cards with an editable count.
export function serviceStack(s: Style, owner: Owner) {
  const c = C[owner];
  const back = [16, 8].map((o) => rect(o, -o, 160, 64, s, { strokeColor: c.stroke, backgroundColor: c.bg }));
  const front = rect(0, 0, 160, 64, s, { strokeColor: c.stroke, backgroundColor: c.bg });
  return group([...back, front, label(front, "+47 services", 18, s)]);
}
