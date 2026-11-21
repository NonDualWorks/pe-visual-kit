// pe-visual-kit · example scenes built only from kit components
// Run:  npm run examples   → writes dist/examples/<scene>-<style>.excalidraw (open on excalidraw.com)
// Each scene is a function. Elements are drawn in the order they are added: earlier = behind.

import { mkdirSync, writeFileSync } from "node:fs";
import * as k from "./kit/index.js";

type Scene = (s: k.Style, put: Put, link: Link) => void;
type Put = (els: k.El[], x: number, y: number, opts?: { w?: number; h?: number; label?: string }) => void;
type Link = (kind: k.FlowKind, x1: number, y1: number, x2: number, y2: number, caption?: string | null) => void;

const app = (name: string, status: string, warn = false): k.EnvSpec =>
  ({ name, kind: "feature env · app", status, owner: "app", statusColor: warn ? k.C.pending.stroke : undefined });

const SCENES: Record<string, Scene> = {
  // Baseline + sandbox namespaces in one Istio mesh (the long-term topology).
  "mesh-topology": (s, put) => {
    put(k.region(s), 0, 0, { w: 1780, h: 940 });
    put(k.cluster(s), 40, 60, { w: 1420, h: 840 });
    put(k.meshBoundary(s), 80, 120, { w: 1340, h: 740 }); // after the cluster, before namespaces → behind them
    put(k.nsBaseline(s), 130, 190, { w: 780, h: 620 });
    put(k.serviceWithSidecar(s, "app"), 180, 270);
    put(k.serviceWithSidecar(s, "platform"), 180, 400);
    put(k.serviceWithSidecar(s, "platform"), 500, 400, { label: "identity" });
    put(k.serviceStack(s, "app"), 190, 560, { label: "+27 services" });
    put(k.serviceStack(s, "platform"), 510, 560, { label: "+20 services" });
    put(k.nsSandbox(s), 980, 190, { w: 400, h: 300 });
    put(k.serviceWithSidecar(s, "app"), 1040, 290);
    put(k.nsBaseline(s), 980, 560, { w: 400, h: 250, label: "ns: istio-system" });
    put(k.controlPlane(s), 1090, 650);
    put(k.database(s, "ledger_db\nRDS Aurora", false), 1540, 200);
    put(k.database(s, "pr482_db\nAurora Serverless", true), 1540, 460);
  },

  // Current state vs short-term proposal: forced sync → pull-based sync with guardrails.
  "sync-today-vs-proposed": (s, put, link) => {
    const ci: k.EnvSpec = { name: "ci", kind: "CI env · shared", status: "f01 just promoted", statusColor: k.C.muted };
    // left: today
    put([k.text("Today: forced sync", 0, 0, 28, s)], 0, 0);
    put(k.envCard(s, ci), 275, 60);
    ["f02", "f05", "f09"].forEach((n, i) => put(k.envCard(s, app(n, "redeploying…", true)), i * 275, 320));
    link("syncForced", 390, 180, 115, 316, null);
    link("syncForced", 390, 180, 390, 316);
    link("syncForced", 390, 180, 665, 316, null);
    put([k.text("Every promotion → 11 full redeploys, right now", 0, 0, 18, s, { strokeColor: k.C.muted })], 0, 470);
    // right: proposed
    const ox = 900;
    put([k.text("Proposed: sync when ready", 0, 0, 28, s)], ox, 0);
    put(k.envCard(s, ci), ox + 275, 60);
    put(k.envCard(s, app("f02", "up to date")), ox, 320);
    put(k.envCard(s, app("f05", "2 behind", true)), ox + 275, 320);
    put(k.envCard(s, app("f09", "5 behind · nudged", true)), ox + 550, 320);
    link("syncPull", ox + 390, 180, ox + 115, 316);
    put(k.badge(s, "ok", "contracts OK"), ox + 275, 450);
    put(k.badge(s, "warn", "ledger 2.6 breaks you"), ox + 550, 450);
    put(k.thresholdBar(s), ox + 20, 520);
  },

  // Gates on the way to CI and to prod; hotfix goes straight to pre-prod, then back-merges to master.
  "guardrails-and-hotfix": (s, put, link) => {
    put(k.badge(s, "warn", "1 behind (hotfix)"), 0, -44);
    put(k.envCard(s, app("f05", "feature done")), 0, 0);
    put(k.gate(s, "automated", "passed", "must be current"), 300, 34);
    put(k.envCard(s, { name: "ci", kind: "CI env · shared", status: "master @ 3f9c2ab", statusColor: k.C.muted }), 720, 0);
    link("promote", 232, 58, 296, 58, null);
    link("promote", 600, 58, 716, 58);

    put(k.envCard(s, { name: "hf1", kind: "hotfix env", status: "based on product/v5.2.0", statusColor: k.C.muted }), 0, 260);
    put(k.gate(s, "human", "passed", "Perf certified"), 300, 294);
    put(k.gate(s, "human", "pending", "RM approval"), 560, 294);
    put(k.envCard(s, { name: "pre-prod", kind: "pinned release", status: "product/v5.2.1", statusColor: k.C.muted }), 800, 260);
    put(k.envCard(s, { name: "prod", kind: "production", status: "product/v5.2.0", statusColor: k.C.muted }), 1160, 260);
    link("promote", 232, 318, 296, 318, null);
    link("promote", 515, 318, 556, 318, null);
    link("promote", 745, 318, 796, 318, null);
    link("promote", 1032, 318, 1156, 318);
    link("backMerge", 115, 256, 835, 120, "back-merge to master");
  },

  // Platform manifest + app manifest → compose → resolve·pin·tag → release → CD (+ overlay) → feature env.
  "manifest-composition": (s, put, link) => {
    const [platform, appM, overlay] = k.MANIFESTS.map(([, m]) => m);
    put(k.manifest(s, platform), 0, 0);
    put(k.manifest(s, appM), 0, 190);
    put(k.compose(s), 330, 140);
    link("promote", 232, 59, 328, 160, null);
    link("promote", 232, 260, 328, 172, null);
    put(k.resolveStep(s), 430, 138);
    link("promote", 384, 166, 426, 166, null);
    put(k.release(s), 650, 108);
    link("promote", 602, 166, 646, 166, null);
    put(k.cdSystem(s), 960, 134);
    link("promote", 884, 166, 956, 166, null);
    put(k.manifest(s, overlay), 650, 300);
    link("deploy", 882, 337, 1055, 202, "overlay");
    put(k.envCard(s, app("f03", "product/v5.3.0 + overlay")), 1300, 108);
    link("deploy", 1152, 166, 1296, 166);
  },

  // ===== Current state, told with the git metaphor =====

  // A. Same workflow, different cost: laptop + git push vs feature env + promote.
  "git-a-laptop-vs-env": (s, put, link) => {
    const T = (str: string, x: number, y: number, size = 26, color?: string) => put([k.text(str, 0, 0, size, s, color ? { strokeColor: color } : {})], x, y);
    T("Git", 0, 0); T("Our environments", 700, 0);
    put(k.laptop(s), 20, 70);
    put(k.mainLine(s, "origin/master", 360), 20, 330);
    link("push", 200, 200, 200, 316);
    put(k.envCard(s, app("f03", "feature done")), 700, 70);
    put(k.envCard(s, { name: "ci", kind: "CI env · shared", status: "master @ 3f9c2ab", statusColor: k.C.muted }), 700, 300);
    link("promote", 815, 190, 815, 296);
    T("rebase: seconds, on a laptop", 20, 400, 18, k.C.passed.stroke);
    T("rebase: redeploy ~50 services + DB", 700, 450, 18, k.C.pending.stroke);
  },

  // B. Twelve branches, one master: each feature env is a long-lived branch.
  "git-b-twelve-branches": (s, put) => {
    put(k.mainLine(s, "master", 1260), 0, 40);
    ["f01", "f02", "f03", "f04"].forEach((n, i) => {
      put(k.branch(s, n), 60 + i * 300, 40);
      put(k.envCard(s, app(n, i === 0 ? "feature done" : "in progress")), 40 + i * 300, 160);
    });
    put([k.text("… up to f12: twelve full copies, each 50 svcs + DB", 0, 0, 18, s, { strokeColor: k.C.muted })], 40, 310);
  },

  // C. One push, eleven rebases: f01 merges, everyone else is redeployed.
  "git-c-one-push-eleven-rebases": (s, put, link) => {
    put(k.mainLine(s, "master", 1000), 0, 40);
    put(k.commit(s, "merge"), 820, 29);
    put([k.text("f01 merged", 0, 0, 16, s, { strokeColor: k.C.passed.stroke })], 860, 0);
    ["f02", "f05", "f09"].forEach((n, i) => {
      put(k.envCard(s, app(n, "redeploying…", true)), 40 + i * 330, 240);
      link("syncForced", 831, 56, 155 + i * 330, 236, i === 1 ? "rebase (forced)" : null);
      put(k.badge(s, "warn", "forced redeploy"), 40 + i * 330, 370);
    });
    put([k.text("× 11 environments, every promotion", 0, 0, 20, s, { strokeColor: k.C.pending.stroke })], 40, 430);
  },

  // ===== Data Isolation Strategy =====

  // Relational ladder: L1 instance per PR, L2 schema per PR, L3 shared schema with tagged rows.
  "data-relational-ladder": (s, put, link) => {
    const T = (str: string, x: number, y: number, size = 22, color?: string) => put([k.text(str, 0, 0, size, s, color ? { strokeColor: color } : {})], x, y);
    const col = [0, 480, 960];
    T("L1 · instance per PR", col[0], 0); T("L2 · schema per PR", col[1], 0); T("L3 · shared, tagged rows", col[2], 0);
    col.forEach((x) => { put(k.service(s, "app"), x, 60, { label: "checkout" }); put(k.service(s, "app"), x + 220, 60, { label: "checkout'" }); });
    // L1
    put(k.database(s, "payments_db\nRDS Aurora", false), col[0] - 5, 220);
    put(k.database(s, "pr482_db\nAurora Serverless", true), col[0] + 215, 220);
    link("request", col[0] + 80, 126, col[0] + 80, 216, null); link("requestTagged", col[0] + 300, 126, col[0] + 300, 216, null);
    // L2
    put(k.frame(s, 400, 150, "one host", { stroke: k.C.neutral.stroke, bg: k.C.neutral.light }), col[1], 230);
    put(k.schema(s, "schema: payments"), col[1] + 20, 300);
    put(k.schema(s, "schema: pr_482", true), col[1] + 230, 300);
    link("request", col[1] + 80, 126, col[1] + 150, 296, null); link("requestTagged", col[1] + 300, 126, col[1] + 305, 296, null);
    // L3
    put(k.database(s, "payments_db\nRDS Aurora", false), col[2] + 115, 220);
    put(k.taggedRows(s), col[2] + 115, 362);
    link("request", col[2] + 80, 126, col[2] + 140, 216, null); link("requestTagged", col[2] + 300, 126, col[2] + 260, 216, null);
    T("isolation: strongest · cost: highest", col[0], 520, 16, k.C.muted);
    T("one host, separate schemas", col[1], 520, 16, k.C.muted);
    T("no DDL allowed: shape is shared", col[2], 520, 16, k.C.pending.stroke);
    T("DDL change OK", col[0], 550, 16, k.C.passed.stroke); T("DDL change OK", col[1], 550, 16, k.C.passed.stroke);
  },

  // Messages ladder: L1 broker per PR, L2 topic per PR, L3 shared topic with tagged messages + filtering consumers.
  "data-messages-ladder": (s, put, link) => {
    const T = (str: string, x: number, y: number, size = 22, color?: string) => put([k.text(str, 0, 0, size, s, color ? { strokeColor: color } : {})], x, y);
    const col = [0, 520, 1040];
    T("L1 · broker per PR", col[0], 0); T("L2 · topic per PR", col[1], 0); T("L3 · shared topic, tagged", col[2], 0);
    // L1
    put(k.frame(s, 230, 110, "broker", { stroke: k.C.neutral.stroke, bg: "transparent" }), col[0], 60);
    put(k.messageLog(s, "orders"), col[0] + 15, 105);
    put(k.frame(s, 230, 110, "broker · pr-482", { stroke: k.C.neutral.stroke, bg: "transparent" }, { strokeStyle: "dashed" }), col[0] + 250, 60);
    put(k.messageLog(s, "orders", true), col[0] + 265, 105);
    put(k.service(s, "app"), col[0] + 35, 260, { label: "consumer" }); put(k.service(s, "app"), col[0] + 285, 260, { label: "consumer'" });
    link("request", col[0] + 115, 152, col[0] + 115, 256, null); link("requestTagged", col[0] + 365, 152, col[0] + 365, 256, null);
    // L2
    put(k.messageLog(s, "orders"), col[1], 105);
    put(k.messageLog(s, "orders.pr-482", true), col[1] + 230, 105);
    put(k.service(s, "app"), col[1] + 20, 260, { label: "consumer" }); put(k.service(s, "app"), col[1] + 250, 260, { label: "consumer'" });
    link("request", col[1] + 100, 152, col[1] + 100, 256, null); link("requestTagged", col[1] + 330, 152, col[1] + 330, 256, null);
    // L3
    put(k.messageLog(s, "orders"), col[2] + 110, 105);
    put(k.message(s, "pr-482"), col[2] + 20, 108);
    put(k.service(s, "app"), col[2], 260, { label: "consumer" }); put(k.service(s, "app"), col[2] + 230, 260, { label: "consumer'" });
    link("request", col[2] + 180, 152, col[2] + 80, 256, "skips tagged"); link("requestTagged", col[2] + 240, 152, col[2] + 310, 256, "tagged only");
    T("isolation: strongest · rarely worth it", col[0], 370, 16, k.C.muted);
    T("producer routes by tag", col[1], 370, 16, k.C.muted);
    T("no sandbox? baseline takes tagged", col[2], 370, 16, k.C.muted);
    T("message shape change OK", col[0], 400, 16, k.C.passed.stroke); T("message shape change OK", col[1], 400, 16, k.C.passed.stroke);
    T("no shape change: consumers share it", col[2], 400, 16, k.C.pending.stroke);
  },

  // How a PR picks its isolation level: automated gates on what changed. Lifecycle tied to the sandbox.
  "data-isolation-decision": (s, put, link) => {
    put(k.envCard(s, { name: "PR #482", kind: "sandbox · overlay", contents: "checkout'", status: "opened", owner: "app" }), 0, 120);
    put(k.gate(s, "automated", "pending", "Liquibase changeset?"), 330, 40);
    put(k.gate(s, "automated", "pending", "Event schema change\nor new consumer?"), 330, 260);
    link("promote", 232, 160, 326, 64, null); link("promote", 232, 200, 326, 284, null);
    put(k.badge(s, "warn", "yes → relational L1 or L2"), 800, 10);
    put(k.badge(s, "ok", "no → relational L3"), 800, 60);
    put(k.badge(s, "warn", "yes → messages L2"), 800, 240);
    put(k.badge(s, "ok", "no → messages L3"), 800, 290);
    link("promote", 720, 64, 796, 25, null); link("promote", 720, 64, 796, 75, null);
    link("promote", 720, 284, 796, 255, null); link("promote", 720, 284, 796, 305, null);
    put(k.badge(s, "neutral", "created with the sandbox · seeded before tests · destroyed with it · TTL 2 days"), 0, 420);
  },

  // PR sandbox, no DDL: overlay service only; shares the baseline DB using a test tenant (relational L3).
  "pr-sandbox-no-ddl": (s, put, link) => prSandbox(s, put, link, false),
  // PR sandbox, with DDL: overlay service + its own ephemeral DB, seeded, then Liquibase applies the PR's changesets (L1).
  "pr-sandbox-ddl": (s, put, link) => prSandbox(s, put, link, true),
};

// Shared layout for the two PR sandbox scenes. Purple = tagged test request, gray = normal request.
function prSandbox(s: k.Style, put: Put, link: Link, ddl: boolean) {
  put(k.badge(s, "warn", "sandbox=pr-482"), 0, 150);
  put(k.badge(s, "neutral", "normal request"), 0, 250);
  put(k.cluster(s), 180, 0, { w: 880, h: 560 });
  put(k.meshBoundary(s), 210, 50, { w: 820, h: 480 });
  put(k.nsBaseline(s), 240, 100, { w: 420, h: 400 });
  put(k.service(s, "app"), 280, 170, { label: "web" });
  put(k.service(s, "app"), 280, 300, { label: "checkout" });
  put(k.serviceStack(s, "app"), 290, 420, { label: "+47 services" });
  put(k.nsSandbox(s), 700, 100, { w: 300, h: 220 });
  put(k.service(s, "app"), 770, 190, { label: "checkout'" });
  link("requestTagged", 150, 165, 276, 192, null);
  link("request", 150, 265, 276, 220, null);
  link("request", 360, 236, 360, 296, null);
  link("requestTagged", 442, 195, 766, 215, null);
  put(k.database(s, ddl ? "payments_db\nRDS Aurora" : "payments_db\nshared · test tenant", false), 1120, 340);
  link("request", 442, 332, 1116, 400, null);
  if (!ddl) {
    link("requestTagged", 850, 256, 1116, 380, null);
    put(k.badge(s, "ok", "no DDL → relational L3: rows tagged pr-482"), 1100, 500);
  } else {
    put(k.database(s, "pr482_db\nAurora Serverless", true), 1120, 40);
    link("requestTagged", 932, 215, 1116, 110, null);
    link("deploy", 1205, 336, 1205, 176, "seed");
    put(k.resolveStep(s), 1380, 70, { label: "Liquibase\nPR changesets" });
    link("deploy", 1376, 100, 1296, 100, null);
    put(k.badge(s, "warn", "DDL → relational L1: own DB, baseline untouched"), 1100, 500);
  }
}

mkdirSync("dist/examples", { recursive: true });
for (const [name, scene] of Object.entries(SCENES)) {
  for (const s of k.STYLES) {
    const elements: k.El[] = [];
    // put: place a component at (x, y); optionally resize its box and rename its main (first) label
    const put: Put = (els, x, y, opts = {}) => {
      for (const e of els) { e.x += x; e.y += y; }
      if (opts.w) els[0].width = opts.w;
      if (opts.h) els[0].height = opts.h;
      if (opts.label) {
        const t = els.find((e) => e.type === "text")!;
        t.text = t.originalText = opts.label;
        t.width = Math.max(...opts.label.split("\n").map((l) => l.length)) * t.fontSize * 0.6;
        const box = els.find((e) => e.id === t.containerId);
        if (box && t.textAlign === "center") t.x = box.x + (box.width - t.width) / 2; // keep bound labels centered
      }
      elements.push(...els);
    };
    // link: a flow arrow from (x1, y1) to (x2, y2)
    const link: Link = (kind, x1, y1, x2, y2, caption) =>
      put(caption === undefined ? k.flow(s, kind, x2 - x1, y2 - y1) : k.flow(s, kind, x2 - x1, y2 - y1, caption), x1, y1);
    scene(s, put, link);
    const file = { type: "excalidraw", version: 2, source: "https://excalidraw.com", elements,
      appState: { viewBackgroundColor: "#ffffff", gridSize: null }, files: {} };
    writeFileSync(`dist/examples/${name}-${s.name}.excalidraw`, JSON.stringify(file, null, 2));
    console.log(`dist/examples/${name}-${s.name}.excalidraw  (${elements.length} elements)`);
  }
}
