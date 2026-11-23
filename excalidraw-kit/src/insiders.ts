// Scenes for the insiders deck (talks/pr-sandboxes-insiders). Built only from kit components.
// Layout rule: requests flow left → right; data (DBs, queues) sits at the far right.
// Names: p01… platform, a01… app, a04′ = a04 as changed in PR 482, T01… suites, E01 = e2e (outside the cluster).

import * as k from "./kit/index.js";

type Put = (els: k.El[], x: number, y: number, opts?: { w?: number; h?: number; label?: string }) => void;
type Link = (kind: k.FlowKind, x1: number, y1: number, x2: number, y2: number, caption?: string | null) => void;
export type Scene = (s: k.Style, put: Put, link: Link) => void;

const T = (s: k.Style, put: Put, str: string, x: number, y: number, size = 18, color = "#1e1e1e") =>
  put([k.text(str, 0, 0, size, s, { strokeColor: color })], x, y);
// Elbow arrow through absolute points (for paths that must go around things).
const path = (s: k.Style, put: Put, pts: number[][], color = k.C.app.stroke) => {
  const [x0, y0] = pts[0];
  const rel = pts.map(([x, y]) => [x - x0, y - y0]);
  const xs = rel.map((p) => p[0]), ys = rel.map((p) => p[1]);
  put([k.base("arrow", 0, 0, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), s, {
    points: rel, strokeColor: color, lastCommittedPoint: null, startBinding: null, endBinding: null,
    startArrowhead: null, endArrowhead: "arrow", roundness: null, elbowed: false })], x0, y0);
};
const wire = (link: Link, x1: number, y1: number, x2: number, y2: number) => link("request", x1, y1, x2, y2, null);

// ---------------------------------------------------------------------------------------------
// Life of a PR (Tier 1). One layout, filled in step by step; `stage` = the last step shown.
// Top row: the PR and its Concourse pipeline so far. Below: the cluster.
type Life = { stage: number; tier2?: boolean; pipeline?: boolean; failed?: boolean; rerun?: boolean };
function life(s: k.Style, put: Put, link: Link, o: Life) {
  const st = o.stage, showPipe = o.pipeline !== false;
  // ---- top row: PR card + pipeline so far
  if (showPipe) {
    put(k.pullRequest(s), 0, 0);
    const J = (name: string, from: number, x: number, w: number, state: k.JobState) => {
      if (st >= from) { put(k.job(s, name, state, w), x, 26); wire(link, x - 30, 48, x, 48); }
    };
    put(k.resource(s, "pr-482 (git)"), 260, 31);
    J("dockerize & publish", 2, 440, 200, "succeeded");
    J("create sandbox infra", 4, 670, 210, "succeeded");
    J("deploy a04′", 5, 910, 150, "succeeded");
    J("T01 · T02 · E01", 7, 1090, 170, st >= 9 ? "succeeded" : st === 8 && o.failed ? "failed" : st === 7 ? "started" : "succeeded");
    if (st === 10) { put(k.job(s, "teardown", "succeeded", 140), 1290, 26); wire(link, 1260, 48, 1290, 48); }
    if (st >= 2) put(k.badge(s, "neutral", "image a04@sha256:9f2c…"), 440, 86);
    if (st >= 3) put(k.badge(s, "warn", o.tier2 ? "plan: code + DDL → Tier 2" : "plan: code change → Tier 1"), 670, 86);
  }
  // ---- cluster
  const Y = 140;
  put(k.cluster(s), 170, Y, { w: 1290, h: 780 });
  put(k.meshBoundary(s), 200, Y + 50, { w: 1230, h: 700 });
  put(k.ingressGateway(s), 230, Y + 120);
  // baseline namespace (always there)
  put(k.nsBaseline(s), 880, Y + 90, { w: 520, h: 630 });
  put(k.service(s, "app"), 910, Y + 130, { label: st === 10 ? "a04 (new)" : "a04" });
  put(k.service(s, "app"), 1150, Y + 130, { label: "a05" });
  put(k.service(s, "platform"), 910, Y + 330);
  put(k.service(s, "platform"), 1150, Y + 330, { label: "p02" });
  put(k.serviceStack(s, "app"), 920, Y + 540, { label: "+47 services" });
  put(k.serviceStack(s, "platform"), 1150, Y + 540, { label: "+47 services" });
  wire(link, 990, Y + 196, 990, Y + 326);
  // data at the far right
  put(k.database(s, "Baseline DB\nRDS Aurora", false), 1530, Y + 300);
  wire(link, 1402, Y + 380, 1526, Y + 380);
  // everyone else: straight to the baseline, above the sandbox
  put(k.badge(s, "neutral", "everyone else"), 0, Y + 140);
  wire(link, 150, Y + 155, 226, Y + 155);
  link("request", 382, Y + 160, 906, Y + 162, null);
  // ---- sandbox (steps 4–9)
  if (st >= 4 && st <= 9) {
    put(k.nsSandbox(s), 420, Y + 190, { w: 420, h: 530 });
    put(k.routingRule(s), 440, Y + 630);
    if (showPipe) put(k.sandboxInfra(s, "pr-482", !!o.tier2, false), 1500, 0);
  }
  if (st >= 5 && st <= 9) {
    put(k.serviceWithSidecar(s, "app", "a04′", true), 460, Y + 285);
    if (st >= 6) put(k.badge(s, "ok", st < 7 ? "helm --wait: ready ✓" : "ready ✓"), 460, Y + 238);
    if (o.tier2) {
      put(k.database(s, "PR DB\nAurora Serverless", true), 1530, Y + 560);
      path(s, put, [[676, Y + 317], [780, Y + 317], [780, Y + 766], [1480, Y + 766], [1480, Y + 640], [1526, Y + 640]]);
      put(k.badge(s, "neutral", "Liquibase: PR changesets"), 1500, Y + 730);
    }
  }
  if (st >= 7 && st <= 9) {
    put(k.testSuite(s, "E01", "e2e", true), 30, Y + 290);
    link("requestTagged", 150, Y + 340, 226, Y + 200, null);
    link("requestTagged", 382, Y + 190, 456, Y + 305, null);
    T(s, put, "purple = carries\nsandbox=pr-482", 20, Y + 410, 15, k.C.app.stroke);
    put(k.testSuite(s, "T01", "contract"), 450, Y + 470);
    put(k.testSuite(s, "T02", "api"), 620, Y + 470);
    link("requestTagged", 510, Y + 466, 520, Y + 352, null);
    link("requestTagged", 680, Y + 466, 600, Y + 352, null);
    link("requestTagged", 676, Y + 317, 906, Y + 360, null);
    const t02 = st === 7 ? "pending" : st === 8 && o.failed ? "blocked" : "passed";
    if (showPipe) { put(k.testResult(s, "passed"), 440, Y + 585); put(k.testResult(s, t02 as k.State), 600, Y + 585); }
    if (o.rerun) { put(k.rerun(s), 740, Y + 585); put(k.badge(s, "neutral", "new push: checks reset → redeploy a04′ → rerun"), 440, Y + 750); }
  }
  // ---- after merge or close
  if (st === 10) {
    put(k.nsSandbox(s), 420, Y + 190, { w: 420, h: 530, label: "ns: pr-482 · deleted" });
    put(k.badge(s, "ok", "merged → main deploys a04 to the baseline"), 440, Y + 300);
    put(k.badge(s, "neutral", "sandbox + routing rule deleted"), 440, Y + 360);
    put(k.ttl(s, "TTL = backup if close is missed"), 440, Y + 420);
  }
}

// ---------------------------------------------------------------------------------------------
export const INSIDERS: Record<string, Scene> = {
  // End state: one baseline, request-routed PR sandboxes, tests inside, e2e outside.
  "ins-end-state": (s, put, link) => life(s, put, link, { stage: 7, pipeline: false }),

  // Life of a PR, Tier 1, step by step.
  "ins-life-1-2": (s, put, link) => life(s, put, link, { stage: 2 }),
  "ins-life-3-4": (s, put, link) => life(s, put, link, { stage: 4 }),
  "ins-life-5-6": (s, put, link) => life(s, put, link, { stage: 6 }),
  "ins-life-7": (s, put, link) => life(s, put, link, { stage: 7 }),
  "ins-life-8-9": (s, put, link) => life(s, put, link, { stage: 9, rerun: true }),
  "ins-life-10": (s, put, link) => life(s, put, link, { stage: 10 }),
  // Tier 2: same steps, plus a PR DB with the PR's changesets.
  "ins-tier2-sandbox": (s, put, link) => life(s, put, link, { stage: 6, tier2: true }),

  // Same harness, new plumbing: today's pipeline vs the PR pipeline.
  "ins-same-pipeline": (s, put, link) => {
    const row = (y: number, title: string, res: string, jobs: [string, number][]) => {
      T(s, put, title, 0, y, 24);
      put(k.resource(s, res, 190), 0, y + 55);
      let x = 230;
      jobs.forEach(([n, w]) => { wire(link, x - 40, y + 72, x, y + 72); put(k.job(s, n, "succeeded", w), x, y + 50); x += w + 40; });
    };
    row(0, "Today", "feature/f04 (git)", [["dockerize & publish", 200], ["deploy → f04", 170], ["T01 · T02 · E01", 180]]);
    put(k.envCard(s, { name: "f04", kind: "feature env · full copy", contents: "100 services + DBs + queues", status: "redeployed on every sync", owner: "app", statusColor: k.C.pending.stroke }), 630, 140);
    row(330, "Proposed", "pr-482 (git)", [["dockerize & publish", 200], ["create sandbox infra", 210], ["deploy → pr-482", 180], ["T01 · T02 · E01", 180]]);
    put(k.sandboxInfra(s, "pr-482", false, false), 470, 470);
    put(k.serviceWithSidecar(s, "app", "a04′", true), 880, 500);
    put(k.badge(s, "ok", "same jobs · same ➕ rerun · same logs"), 1150, 520);
    put(k.badge(s, "neutral", "only a04′ is deployed; calls reach the baseline through the mesh"), 880, 610);
  },

  // The 10 steps on one map, with the Concourse job that does each.
  "ins-pr-map": (s, put) => {
    const steps: [string, string][] = [
      ["PR opened", "pr-482 (git)"], ["Dockerize & publish", "dockerize & publish"], ["Plan: pick the tier", "plan"],
      ["Create sandbox infra", "create sandbox infra"], ["Deploy a04′ (Helm)", "deploy a04′"], ["Ready check", "deploy a04′"],
      ["Tests run (tagged)", "T01 · T02 · E01"], ["Results on the PR", "posts PR status"], ["Re-push loop", "same jobs again"],
      ["Merge or close", "teardown"],
    ];
    steps.forEach(([t, j], i) => {
      const x = (i % 5) * 330, y = i < 5 ? 0 : 230;
      put(k.step(s, i + 1), x, y);
      T(s, put, t, x + 50, y + 4, 20);
      put(k.job(s, j, i === 9 ? "pending" : "succeeded", 230), x + 50, y + 50);
    });
    T(s, put, "Concourse job ↑", 0, 440, 16, k.C.muted);
  },

  // Three tiers of services, in the order the baseline is built.
  "ins-tiers": (s, put, link) => {
    const cols: [string, string, string][] = [["Tier 1 · no data", "REST only (gateway-like)", "PR adds: routing rule"],
      ["Tier 2 · relational DB", "owns a schema", "PR adds: + PR DB schema"], ["Tier 3 · DB + messages", "owns a schema, uses SNS/SQS", "PR adds: + PR SQS queue"]];
    cols.forEach(([t, sub, adds], i) => {
      const x = i * 560;
      T(s, put, t, x, 0, 24); T(s, put, sub, x, 38, 16, k.C.muted);
      put(k.service(s, "app"), x, 100, { label: ["a01", "a04", "a07"][i] });
      if (i >= 1) { put(k.database(s, "Baseline DB", false), x + 250, 80); wire(link, x + 162, 132, x + 246, 132); }
      if (i === 2) { put(k.sqsQueue(s, "orders-a07", "filter: no sandbox"), x + 200, 250); wire(link, x + 80, 166, x + 196, 270); }
      put(k.badge(s, "warn", adds), x, 340);
    });
    link("promote", 0, 410, 1500, 410, "build the baseline in this order");
  },

  // Choosing the baseline: service groups first, regions later.
  "ins-baseline-groups": (s, put, link) => {
    const doms: [string, string[]][] = [["orders", ["a01", "a02", "p01"]], ["payments", ["a04", "a05", "p02"]], ["identity", ["a09", "p03", "p04"]]];
    doms.forEach(([d, svcs], i) => {
      const x = i * 520;
      put(k.nsBaseline(s), x, 0, { w: 460, h: 300, label: `baseline · ${d}` });
      svcs.forEach((n, j) => put(k.service(s, n.startsWith("p") ? "platform" : "app"), x + 30 + (j % 2) * 210, 70 + Math.floor(j / 2) * 100, { label: n }));
    });
    link("request", 460, 150, 516, 150, null); link("request", 980, 150, 1036, 150, null);
    put(k.badge(s, "neutral", "1 · start with one baseline"), 0, 350);
    put(k.badge(s, "neutral", "2 · split by service group (calls mostly stay inside)"), 0, 400);
    put(k.badge(s, "neutral", "3 · split by developer region when maintenance collides"), 0, 450);
  },

  // Tier 2 on merge: DDL to the baseline DB first (expand), then the new a04.
  "ins-tier2-merge": (s, put, link) => {
    put(k.pullRequest(s), 0, 40);
    put(k.step(s, 1), 300, 0); T(s, put, "Liquibase applies the\nchangesets (expand only)", 350, 0, 18);
    put(k.database(s, "Baseline DB\nRDS Aurora", false), 360, 90);
    put(k.step(s, 2), 700, 0); T(s, put, "deploy a04 (new)\nto the baseline", 750, 0, 18);
    put(k.service(s, "app"), 760, 120, { label: "a04 (new)" });
    put(k.step(s, 3), 1080, 0); T(s, put, "a later release:\ncontract (remove old)", 1130, 0, 18);
    put(k.badge(s, "neutral", "after no running version needs it"), 1130, 130);
    link("promote", 222, 90, 352, 140, null); link("promote", 540, 150, 756, 150, null); link("promote", 924, 150, 1126, 145, null);
    put(k.badge(s, "ok", "old a04 still works on the new schema → code can roll back, DB never does"), 0, 300);
  },

  // Tier 3: one topic, a queue per audience, filter policies on the subscriptions.
  "ins-tier3-messages": (s, put, link) => {
    put(k.service(s, "platform"), 0, 250, { label: "p01" });
    put(k.message(s, "pr-482"), 200, 200);
    link("requestTagged", 164, 282, 316, 282, null);
    put(k.snsTopic(s), 320, 245);
    put(k.sqsQueue(s, "orders-a04", "filter: no sandbox"), 620, 60);
    put(k.sqsQueue(s, "orders-a04-pr-482", "filter: sandbox = pr-482", true), 620, 420);
    link("request", 490, 270, 616, 90, null);
    link("requestTagged", 490, 290, 616, 440, null);
    put(k.nsBaseline(s), 1000, 0, { w: 300, h: 200 });
    put(k.service(s, "app"), 1060, 80);
    put(k.nsSandbox(s), 1000, 360, { w: 300, h: 200 });
    put(k.service(s, "app", "a04′", true), 1060, 440);
    wire(link, 870, 82, 1056, 110);
    link("requestTagged", 920, 442, 1056, 470, null);
    put(k.badge(s, "neutral", "same SNS topic · new queue per PR · baseline queue skips tagged messages"), 0, 600);
  },

  // Test suites live in their own repos; a test change is just another component in the PR's sandbox.
  "ins-tests-components": (s, put) => {
    const rows: [string, string[], string][] = [["PR on the service repo", ["a04′", "T01"], "new service, current tests"],
      ["PR on the test repo", ["T01′"], "new tests vs the plain baseline"], ["Both (linked)", ["a04′", "T01′"], "new service + new tests"]];
    rows.forEach(([t, parts, note], i) => {
      const y = i * 190;
      T(s, put, t, 0, y + 40, 20);
      put(k.nsSandbox(s), 300, y, { w: 460, h: 160, label: "sandbox" });
      parts.forEach((p, j) => p.startsWith("T") ? put(k.testSuite(s, p, "api"), 330 + j * 200, y + 45) : put(k.service(s, "app", p, true), 330 + j * 200, y + 70));
      T(s, put, note, 800, y + 60, 16, k.C.muted);
    });
  },

  // Transition: today's feature env → feature sandbox → per-PR sandboxes.
  "ins-transition": (s, put) => {
    const cols = ["1 · Today", "2 · Feature sandbox", "3 · Per-PR sandboxes"];
    cols.forEach((c, i) => T(s, put, c, i * 560, 0, 24));
    put(k.envCard(s, { name: "f04", kind: "feature env · full copy", contents: "100 services + DBs + queues", status: "branch feature/FEAT-123", owner: "app", statusColor: k.C.app.stroke }), 0, 60);
    put(k.badge(s, "warn", "every repo's branch → one full copy"), 0, 200);
    put(k.nsSandbox(s), 560, 60, { w: 420, h: 200, label: "ns: feat-123 · sandbox" });
    put(k.service(s, "app", "a04′", true), 590, 130); put(k.testSuite(s, "T01′", "api"), 790, 120);
    put(k.badge(s, "ok", "same branch name · only changed repos deployed"), 560, 280);
    put(k.nsSandbox(s), 1120, 60, { w: 300, h: 110, label: "ns: pr-482" });
    put(k.service(s, "app", "a04′", true), 1150, 100);
    put(k.nsSandbox(s), 1120, 190, { w: 300, h: 110, label: "ns: pr-517" });
    put(k.service(s, "platform", "p02′", true), 1150, 230);
    put(k.badge(s, "ok", "linked by a shared name only when needed"), 1120, 330);
  },

  // Linked PRs: PRs share one link name; the sandbox is named after it, so order doesn't matter.
  "ins-linked-prs": (s, put, link) => {
    put(k.pullRequest(s, "482", "a04", "FEAT-123"), 0, 0);
    put(k.pullRequest(s, "77", "T01 (test repo)", "FEAT-123"), 0, 200);
    put(k.badge(s, "warn", "link name: FEAT-123"), 300, 140);
    link("deploy", 222, 50, 556, 120, "first PR: creates");
    link("deploy", 222, 250, 556, 220, "later PRs: add to it");
    put(k.nsSandbox(s), 560, 40, { w: 460, h: 260, label: "ns: sandbox-feat-123" });
    put(k.service(s, "app", "a04′", true), 590, 130); put(k.testSuite(s, "T01′", "api"), 800, 110);
    put(k.badge(s, "neutral", "one routing key · missing services fall through to the baseline"), 560, 330);
  },

  // Concourse as the harness: which suite failed, logs, rerun.
  "ins-harness": (s, put) => {
    put(k.prPipeline(s, "test-failed"), 0, 0);
    put(k.rerun(s), 1095, 123);
    put(k.badge(s, "neutral", "T02 output streamed into the job log"), 860, 290);
    put(k.badge(s, "warn", "link: logs & traces · sandbox=pr-482"), 860, 335);
    put(k.badge(s, "ok", "➕ reruns just this suite"), 1140, 120);
  },

  // A failed deploy: nothing tested, nothing rolled out, sandbox kept to inspect.
  "ins-deploy-failed": (s, put) => {
    put(k.prPipeline(s, "deploy-failed"), 0, 0);
    put(k.badge(s, "warn", "helm --wait --atomic → rolled back"), 600, 290);
    put(k.badge(s, "neutral", "tests skipped · PR check fails with log link"), 600, 335);
    put(k.ttl(s, "sandbox kept to inspect · TTL"), 600, 380);
  },

  // PR DBs by domain: one shared cluster per domain, a schema per PR.
  "ins-domain-prdbs": (s, put, link) => {
    ["orders", "payments", "identity"].forEach((d, i) => {
      const x = i * 470;
      T(s, put, `${d} domain`, x, 0, 22);
      put(k.database(s, `PR DB · ${d}\nAurora Serverless`, false), x, 50);
      put(k.schema(s, "pr_482", true), x + 200, 60); put(k.schema(s, "pr_517", true), x + 200, 115);
    });
    put(k.badge(s, "neutral", "~100 PR schemas per cluster · scale to 0 when idle · schema dropped with the sandbox"), 0, 240);
  },

  // Service candidate: after merge, the new a04 runs next to the live one; only tagged tests reach it.
  "ins-service-candidate": (s, put, link) => {
    put(k.testSuite(s, "E01", "post-merge", true), 0, 120);
    put(k.badge(s, "neutral", "everyone else"), 0, 330);
    put(k.nsBaseline(s), 260, 0, { w: 760, h: 460 });
    put(k.service(s, "app", "a04 v2 · candidate", true), 300, 90, { w: 240, label: "a04 v2 · candidate" });
    put(k.service(s, "app", "a04 v1 · live"), 300, 300, { w: 240, label: "a04 v1 · live" });
    put(k.service(s, "platform"), 720, 190);
    put(k.serviceStack(s, "app"), 720, 340, { label: "+97 services" });
    link("requestTagged", 122, 170, 296, 122, null);
    T(s, put, "route=a04-candidate", 0, 240, 15, k.C.app.stroke);
    link("request", 150, 345, 316, 332, null);
    wire(link, 542, 122, 716, 210); wire(link, 542, 332, 716, 232);
    put(k.routingRule(s, "route=a04-candidate", "a04 v2"), 1060, 60);
    put(k.badge(s, "ok", "pass → shift traffic to v2, remove v1"), 1060, 200);
    put(k.badge(s, "warn", "fail → remove v2, revert main · nobody noticed"), 1060, 250);
    put(k.badge(s, "neutral", "only the changed service gets a second copy, for minutes"), 1060, 300);
  },
};
